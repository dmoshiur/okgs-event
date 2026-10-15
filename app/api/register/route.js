import { NextResponse } from "next/server";
import { isValidAddress } from "@/data/bd-geo";
import { db, getSystemConfig, initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateQRDataUrl, generateUserCode } from "@/lib/qr";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import { sendRegistrationEmail } from "@/lib/email";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9().\s-]{7,20}$/;

export async function POST(request) {
  try {
    await initDb();
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const emailInput = formData.get("email")?.toString().trim() || "";
    const email = emailInput ? emailInput.toLowerCase() : null;
    const password = formData.get("password")?.toString() || "";
    const address = {
      division: formData.get("division")?.toString().trim() || "",
      district: formData.get("district")?.toString().trim() || "",
      upazila: formData.get("upazila")?.toString().trim() || "",
      union_name: formData.get("union_name")?.toString().trim() || "",
    };
    const institute = formData.get("institute")?.toString().trim() || null;
    const sscBatch = formData.get("ssc_batch")?.toString().trim() || null;
    const photoFile = formData.get("photo");

    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
    }
    const digits = phone.replace(/\D/g, "");
    if (!PHONE_PATTERN.test(phone) || digits.length < 7 || digits.length > 15) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json({ error: "Password must be at least 8 characters and no more than 72 bytes." }, { status: 400 });
    }
    if (email && (email.length > 254 || !EMAIL_PATTERN.test(email))) {
      return NextResponse.json({ error: "Enter a valid email address or leave it blank." }, { status: 400 });
    }
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: "Choose a valid division, district, upazila, and union." }, { status: 400 });
    }
    if (!photoFile || typeof photoFile === "string") {
      return NextResponse.json({ error: "A profile photo is required." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(photoFile.type)) {
      return NextResponse.json({ error: "Use a JPEG, PNG, or WebP photo." }, { status: 400 });
    }
    if (photoFile.size <= 0 || photoFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Your photo must be smaller than 5 MB." }, { status: 400 });
    }

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE phone = ?",
      args: [phone],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
    }

    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
    let photoUrl;
    try {
      photoUrl = await uploadImageFromBuffer(photoBuffer, "okgs/users");
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      const status = error.message?.includes("Cloudinary is not configured") ? 503 : 502;
      return NextResponse.json(
        { error: status === 503 ? error.message : "The photo could not be uploaded. Please try again." },
        { status }
      );
    }

    const passwordHash = await hashPassword(password);
    let userCode;
    let qrCodeUrl;
    let result;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      userCode = generateUserCode();
      qrCodeUrl = await generateQRDataUrl(userCode);
      try {
        result = await db.execute({
          sql: `INSERT INTO users (
            user_code, name, phone, email, password_hash,
            division, district, upazila, union_name,
            institute, ssc_batch, photo_url, qr_code_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userCode,
            name,
            phone,
            email,
            passwordHash,
            address.division,
            address.district,
            address.upazila,
            address.union_name,
            institute,
            sscBatch,
            photoUrl,
            qrCodeUrl,
          ],
        });
        break;
      } catch (error) {
        const message = String(error.message || "");
        if (message.includes("users.user_code") && attempt < 2) continue;
        if (message.includes("UNIQUE constraint failed: users.phone")) {
          return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
        }
        throw error;
      }
    }

    let emailStatus = email ? "failed" : "not_provided";
    if (email) {
      try {
        const config = await getSystemConfig();
        const delivery = await sendRegistrationEmail(email, {
          name,
          user_code: userCode,
          qrDataUrl: qrCodeUrl,
          schoolName: config?.school_name_1,
          eventTitle: config?.event_title,
        });
        emailStatus = delivery.sent ? "sent" : "not_configured";
      } catch (error) {
        console.error("Registration email failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      email_status: emailStatus,
      user: {
        id: Number(result.lastInsertRowid),
        user_code: userCode,
        name,
        phone,
        email,
        photo_url: photoUrl,
        qr_code_url: qrCodeUrl,
        ...address,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "We could not complete your registration. Please try again." },
      { status: 500 }
    );
  }
}
