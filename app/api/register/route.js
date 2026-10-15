import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateUserCode, generateQRDataUrl } from "@/lib/qr";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import { sendRegistrationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await initDb();
    const formData = await req.formData();

    const name = formData.get("name")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const email = formData.get("email")?.toString().trim() || null;
    const password = formData.get("password")?.toString();
    const division = formData.get("division")?.toString();
    const district = formData.get("district")?.toString();
    const upazila = formData.get("upazila")?.toString();
    const union_name = formData.get("union_name")?.toString();
    const institute = formData.get("institute")?.toString() || null;
    const ssc_batch = formData.get("ssc_batch")?.toString() || null;
    const photoFile = formData.get("photo");

    if (!name || !phone || !password || !division || !district || !upazila || !union_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!photoFile || typeof photoFile === "string") {
      return NextResponse.json({ error: "Photo required" }, { status: 400 });
    }

    // Check duplicate phone
    const existing = await db.execute({ sql: "SELECT id FROM users WHERE phone = ?", args: [phone] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 409 });
    }

    // Upload photo
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    let photo_url;
    try {
      photo_url = await uploadImageFromBuffer(buffer, "okgs/users");
    } catch (e) {
      console.error("Cloudinary upload failed, using placeholder", e);
      photo_url = "https://res.cloudinary.com/demo/image/upload/v1/okgs/placeholder-user.jpg";
    }

    const user_code = generateUserCode();
    const qrContent = user_code; // QR will contain user_code for scanning
    const qr_code_url = await generateQRDataUrl(qrContent);

    const password_hash = await hashPassword(password);

    const result = await db.execute({
      sql: `INSERT INTO users (user_code, name, phone, email, password_hash, division, district, upazila, union_name, institute, ssc_batch, photo_url, qr_code_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [user_code, name, phone, email, password_hash, division, district, upazila, union_name, institute, ssc_batch, photo_url, qr_code_url],
    });

    const userId = Number(result.lastInsertRowid);

    // Send email if provided
    if (email) {
      // Fire and forget
      sendRegistrationEmail(email, { name, user_code, qrDataUrl: qr_code_url, photoUrl: photo_url }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        user_code,
        name,
        phone,
        email,
        photo_url,
        qr_code_url,
        division,
        district,
        upazila,
        union_name,
      },
    });
  } catch (e) {
    console.error("Register error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
