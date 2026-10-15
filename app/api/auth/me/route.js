import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    await initDb();
    const payload = getAuthFromRequest(request);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (payload.type === "admin") {
      const result = await db.execute({
        sql: "SELECT id, username, email, role FROM admins WHERE id = ?",
        args: [payload.id],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      return NextResponse.json({ authenticated: true, ...result.rows[0], type: "admin" });
    }

    if (payload.type === "user") {
      const result = await db.execute({
        sql: `SELECT id, user_code, name, phone, email, photo_url, qr_code_url, created_at
          FROM users WHERE id = ?`,
        args: [payload.id],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      return NextResponse.json({ authenticated: true, ...result.rows[0], type: "user" });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ error: "Unable to check session." }, { status: 500 });
  }
}
