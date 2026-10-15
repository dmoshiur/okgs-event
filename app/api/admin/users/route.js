import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isValidAddress } from "@/data/bd-geo";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest, hashPassword } from "@/lib/auth";
import { generateQRDataUrl, generateUserCode } from "@/lib/qr";

const SAFE_USER_COLUMNS = `id, user_code, name, phone, email, division, district,
  upazila, union_name, institute, ssc_batch, photo_url, qr_code_url, created_at`;
const PHONE_PATTERN = /^\+?[0-9().\s-]{7,20}$/;

export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().slice(0, 120);
    const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(500, Math.max(1, requestedLimit))
      : 50;
    const offset = (page - 1) * limit;

    let where = "";
    let args = [];
    if (search) {
      where = "WHERE name LIKE ? OR phone LIKE ? OR user_code LIKE ? OR email LIKE ?";
      const like = `%${search}%`;
      args = [like, like, like, like];
    }

    const [usersResult, countResult] = await Promise.all([
      db.execute({
        sql: `SELECT ${SAFE_USER_COLUMNS} FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      }),
      db.execute({
        sql: `SELECT COUNT(*) AS count FROM users ${where}`,
        args,
      }),
    ]);

    return NextResponse.json({
      users: usersResult.rows,
      total: Number(countResult.rows[0]?.count || 0),
      page,
      limit,
    });
  } catch (error) {
    console.error("Attendee list failed:", error);
    return NextResponse.json({ error: "Unable to load attendees." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase() || null;
    const address = {
      division: String(body.division || "").trim(),
      district: String(body.district || "").trim(),
      upazila: String(body.upazila || "").trim(),
      union_name: String(body.union_name || "").trim(),
    };
    const institute = String(body.institute || "").trim() || null;
    const sscBatch = String(body.ssc_batch || "").trim() || null;
    const photoUrl = String(body.photo_url || "/okgs-mark.svg").trim();

    if (!name || name.length > 100 || !PHONE_PATTERN.test(phone)) {
      return NextResponse.json({ error: "Enter a valid attendee name and phone number." }, { status: 400 });
    }
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: "Choose a valid division, district, upazila, and union." }, { status: 400 });
    }
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (photoUrl.length > 2048 || !(photoUrl.startsWith("/") || /^https:\/\//i.test(photoUrl))) {
      return NextResponse.json({ error: "Enter a valid photo URL." }, { status: 400 });
    }

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE phone = ?",
      args: [phone],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
    }

    const userCode = generateUserCode();
    const qrCodeUrl = await generateQRDataUrl(userCode);
    const unsharedPassword = randomBytes(32).toString("hex");
    const passwordHash = await hashPassword(unsharedPassword);
    const result = await db.execute({
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

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
      user_code: userCode,
    });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: users.phone")) {
      return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
    }
    console.error("Manual attendee creation failed:", error);
    return NextResponse.json({ error: "Unable to create attendee." }, { status: 500 });
  }
}
