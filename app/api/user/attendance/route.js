import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    await initDb();
    const auth = getAuthFromRequest(request, "user");
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.execute({
      sql: `SELECT attendance_logs.*, admins.username AS scanned_by_name
        FROM attendance_logs
        LEFT JOIN admins ON attendance_logs.scanned_by = admins.id
        WHERE attendance_logs.user_id = ?
        ORDER BY attendance_logs.timestamp DESC, attendance_logs.id DESC`,
      args: [auth.id],
    });
    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Attendance lookup failed:", error);
    return NextResponse.json({ error: "Unable to load attendance history." }, { status: 500 });
  }
}
