import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await initDb();
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/okgs_token=([^;]+)/);
    if (!match) return NextResponse.json({ authenticated: false }, { status: 401 });
    const token = decodeURIComponent(match[1]);
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

    if (payload.type === "admin") {
      const res = await db.execute({ sql: "SELECT id, username, email, role FROM admins WHERE id = ?", args: [payload.id] });
      if (res.rows.length === 0) return NextResponse.json({ authenticated: false }, { status: 401 });
      return NextResponse.json({ authenticated: true, ...res.rows[0], type: "admin" });
    } else {
      const res = await db.execute({ sql: "SELECT id, user_code, name, phone, email, photo_url, qr_code_url FROM users WHERE id = ?", args: [payload.id] });
      if (res.rows.length === 0) return NextResponse.json({ authenticated: false }, { status: 401 });
      return NextResponse.json({ authenticated: true, ...res.rows[0], type: "user" });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
