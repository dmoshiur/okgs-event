import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await initDb();
    const body = await req.json();
    const { identifier, password } = body; // identifier can be phone or email or username

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password required" }, { status: 400 });
    }

    // Try admin first (username or email)
    const adminRes = await db.execute({
      sql: `SELECT * FROM admins WHERE email = ? OR username = ? LIMIT 1`,
      args: [identifier, identifier],
    });
    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      const ok = await verifyPassword(password, admin.password_hash);
      if (!ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const token = signToken({ id: admin.id, role: admin.role, type: "admin", email: admin.email, username: admin.username });
      const res = NextResponse.json({ success: true, role: admin.role, type: "admin", redirect: "/admin" });
      res.cookies.set("okgs_token", token, { httpOnly: true, path: "/", maxAge: 60*60*24*7, sameSite: "lax" });
      return res;
    }

    // Try user (phone or email)
    const userRes = await db.execute({
      sql: `SELECT * FROM users WHERE phone = ? OR email = ? LIMIT 1`,
      args: [identifier, identifier],
    });
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const token = signToken({ id: user.id, role: "user", type: "user", user_code: user.user_code });
      const res = NextResponse.json({ success: true, role: "user", type: "user", redirect: "/dashboard" });
      res.cookies.set("okgs_token", token, { httpOnly: true, path: "/", maxAge: 60*60*24*7, sameSite: "lax" });
      return res;
    }

    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
