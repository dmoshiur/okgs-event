import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";
import { generateUserCode, generateQRDataUrl } from "@/lib/qr";

function getAuth(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/okgs_token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload || payload.type !== "admin") return null;
  return payload;
}

export async function GET(req) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM users";
    let countSql = "SELECT COUNT(*) as cnt FROM users";
    let args = [];
    let countArgs = [];

    if (search) {
      sql += " WHERE name LIKE ? OR phone LIKE ? OR user_code LIKE ? OR email LIKE ?";
      countSql += " WHERE name LIKE ? OR phone LIKE ? OR user_code LIKE ? OR email LIKE ?";
      const like = `%${search}%`;
      args = [like, like, like, like];
      countArgs = [like, like, like, like];
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const res = await db.execute({ sql, args });
    const cntRes = await db.execute({ sql: countSql, args: countArgs });

    return NextResponse.json({
      users: res.rows,
      total: cntRes.rows[0]?.cnt || 0,
      page,
      limit,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, phone, email, division, district, upazila, union_name, institute, ssc_batch, photo_url } = body;

    if (!name || !phone || !division || !district || !upazila || !union_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.execute({ sql: "SELECT id FROM users WHERE phone = ?", args: [phone] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Phone already exists" }, { status: 409 });
    }

    const user_code = generateUserCode();
    const qr_code_url = await generateQRDataUrl(user_code);
    const password_hash = await hashPassword("123456"); // default for manual entry

    const result = await db.execute({
      sql: `INSERT INTO users (user_code, name, phone, email, password_hash, division, district, upazila, union_name, institute, ssc_batch, photo_url, qr_code_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [user_code, name, phone, email || null, password_hash, division, district, upazila, union_name, institute || null, ssc_batch || null, photo_url || "https://res.cloudinary.com/demo/image/upload/v1/okgs/placeholder-user.jpg", qr_code_url],
    });

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid), user_code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
