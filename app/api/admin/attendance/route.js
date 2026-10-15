import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getAuth(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/okgs_token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload || payload.type !== "admin") return null;
  return payload;
}

export async function GET(req) {
  await initDb();
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const limit = parseInt(searchParams.get("limit") || "100");

  let sql = `
    SELECT attendance_logs.*, users.name, users.user_code, users.photo_url, admins.username as scanned_by_name
    FROM attendance_logs
    LEFT JOIN users ON attendance_logs.user_id = users.id
    LEFT JOIN admins ON attendance_logs.scanned_by = admins.id
    ORDER BY attendance_logs.timestamp DESC LIMIT ?
  `;
  let args = [limit];

  if (userId) {
    sql = `
      SELECT attendance_logs.*, users.name, users.user_code, users.photo_url, admins.username as scanned_by_name
      FROM attendance_logs
      LEFT JOIN users ON attendance_logs.user_id = users.id
      LEFT JOIN admins ON attendance_logs.scanned_by = admins.id
      WHERE attendance_logs.user_id = ?
      ORDER BY attendance_logs.timestamp DESC LIMIT ?
    `;
    args = [userId, limit];
  }

  const res = await db.execute({ sql, args });
  return NextResponse.json({ logs: res.rows });
}
