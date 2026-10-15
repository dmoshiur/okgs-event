import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await initDb();
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/okgs_token=([^;]+)/);
    if (!match) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(decodeURIComponent(match[1]));
    if (!payload || payload.type !== "user") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await db.execute({
      sql: `SELECT attendance_logs.*, admins.username as scanned_by_name FROM attendance_logs LEFT JOIN admins ON attendance_logs.scanned_by = admins.id WHERE user_id = ? ORDER BY timestamp DESC`,
      args: [payload.id],
    });
    return NextResponse.json({ logs: res.rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
