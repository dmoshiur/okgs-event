import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request) {
  let transaction;
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const qrCode = String(body?.qr_code || "").trim();
    const requestedType = body?.type;
    if (!qrCode || qrCode.length > 64) {
      return NextResponse.json({ error: "A valid QR registration code is required." }, { status: 400 });
    }
    if (requestedType && !["check_in", "check_out"].includes(requestedType)) {
      return NextResponse.json({ error: "Invalid attendance action." }, { status: 400 });
    }

    transaction = await db.transaction("write");
    const userResult = await transaction.execute({
      sql: `SELECT id, user_code, name, phone, email, photo_url, division, district,
        upazila, union_name, institute, ssc_batch
        FROM users WHERE user_code = ?`,
      args: [qrCode],
    });
    const user = userResult.rows[0];
    if (!user) {
      await transaction.rollback();
      transaction = null;
      return NextResponse.json({ error: "Invalid QR — attendee not found.", valid: false }, { status: 404 });
    }

    let action = requestedType;
    if (!action) {
      const lastLog = await transaction.execute({
        sql: "SELECT type FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC, id DESC LIMIT 1",
        args: [user.id],
      });
      action = lastLog.rows[0]?.type === "check_in" ? "check_out" : "check_in";
    }

    await transaction.execute({
      sql: "INSERT INTO attendance_logs (user_id, type, scanned_by) VALUES (?, ?, ?)",
      args: [user.id, action, auth.id],
    });
    const logsResult = await transaction.execute({
      sql: "SELECT id, type, timestamp, scanned_by FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC, id DESC LIMIT 5",
      args: [user.id],
    });
    await transaction.commit();
    transaction = null;

    return NextResponse.json({
      success: true,
      valid: true,
      user,
      action,
      logs: logsResult.rows,
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    console.error("QR scan failed:", error);
    return NextResponse.json({ error: "Unable to record this scan." }, { status: 500 });
  }
}
