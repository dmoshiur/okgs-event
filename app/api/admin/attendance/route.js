import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(500, Math.max(1, requestedLimit))
      : 100;

    const where = userId ? "WHERE attendance_logs.user_id = ?" : "";
    const args = userId ? [userId, limit] : [limit];
    const result = await db.execute({
      sql: `SELECT attendance_logs.*, users.name, users.user_code, users.photo_url,
        admins.username AS scanned_by_name
        FROM attendance_logs
        LEFT JOIN users ON attendance_logs.user_id = users.id
        LEFT JOIN admins ON attendance_logs.scanned_by = admins.id
        ${where}
        ORDER BY attendance_logs.timestamp DESC, attendance_logs.id DESC
        LIMIT ?`,
      args,
    });
    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Attendance logs lookup failed:", error);
    return NextResponse.json({ error: "Unable to load attendance logs." }, { status: 500 });
  }
}
