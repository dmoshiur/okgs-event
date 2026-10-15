import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { setAuthCookie, signToken, verifyPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const identifier = String(body?.identifier || "").trim();
    const password = String(body?.password || "");

    if (!identifier || !password || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        { error: "Enter a valid account identifier and password." },
        { status: 400 }
      );
    }

    const normalizedEmail = identifier.toLowerCase();
    const adminResult = await db.execute({
      sql: "SELECT id, username, email, password_hash, role FROM admins WHERE lower(email) = ? OR username = ? LIMIT 1",
      args: [normalizedEmail, identifier],
    });
    const admin = adminResult.rows[0];

    if (admin && (await verifyPassword(password, admin.password_hash))) {
      const token = signToken({
        id: admin.id,
        role: admin.role,
        type: "admin",
        email: admin.email,
        username: admin.username,
      });
      return setAuthCookie(
        NextResponse.json({ success: true, role: admin.role, type: "admin", redirect: "/admin" }),
        token
      );
    }

    const userResult = await db.execute({
      sql: "SELECT id, user_code, phone, email, password_hash FROM users WHERE phone = ? OR lower(email) = ? OR upper(user_code) = ? LIMIT 1",
      args: [identifier, normalizedEmail, identifier.toUpperCase()],
    });
    const user = userResult.rows[0];

    if (user && (await verifyPassword(password, user.password_hash))) {
      const token = signToken({
        id: user.id,
        role: "user",
        type: "user",
        user_code: user.user_code,
      });
      return setAuthCookie(
        NextResponse.json({ success: true, role: "user", type: "user", redirect: "/dashboard" }),
        token
      );
    }

    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  } catch (error) {
    console.error("Sign-in failed:", error);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
