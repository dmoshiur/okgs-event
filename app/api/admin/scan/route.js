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

export async function POST(req) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { qr_code, type } = await req.json(); // qr_code is user_code
    if (!qr_code) return NextResponse.json({ error: "QR code required" }, { status: 400 });

    // Find user by user_code
    const userRes = await db.execute({ sql: "SELECT * FROM users WHERE user_code = ?", args: [qr_code.trim()] });
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid QR - User not found", valid: false }, { status: 404 });
    }
    const user = userRes.rows[0];

    // Determine check_in / check_out logic: if last log was check_in, next is check_out, else check_in
    // But allow explicit type override
    let logType = type;
    if (!logType) {
      const lastLog = await db.execute({
        sql: "SELECT type FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1",
        args: [user.id],
      });
      if (lastLog.rows.length === 0 || lastLog.rows[0].type === "check_out") {
        logType = "check_in";
      } else {
        logType = "check_out";
      }
    }

    if (!["check_in", "check_out"].includes(logType)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await db.execute({
      sql: "INSERT INTO attendance_logs (user_id, type, scanned_by) VALUES (?, ?, ?)",
      args: [user.id, logType, auth.id],
    });

    // Get updated logs for this user
    const logsRes = await db.execute({
      sql: "SELECT * FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 5",
      args: [user.id],
    });

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        user_code: user.user_code,
        name: user.name,
        phone: user.phone,
        email: user.email,
        photo_url: user.photo_url,
        division: user.division,
        district: user.district,
        upazila: user.upazila,
        union_name: user.union_name,
        institute: user.institute,
        ssc_batch: user.ssc_batch,
      },
      action: logType,
      logs: logsRes.rows,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
