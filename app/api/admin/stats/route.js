import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

// Day boundaries follow Bangladesh time (UTC+6), where the event runs.
const TODAY = "date(timestamp, '+6 hours') = date('now', '+6 hours')";

export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [registered, admins, inside, today] = await Promise.all([
      db.execute("SELECT COUNT(*) AS count FROM users"),
      db.execute("SELECT COUNT(*) AS count FROM admins"),
      db.execute(`SELECT COUNT(*) AS count FROM (
        SELECT type, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC, id DESC) AS rn
        FROM attendance_logs
      ) WHERE rn = 1 AND type = 'check_in'`),
      db.execute(`SELECT
        SUM(CASE WHEN type = 'check_in' THEN 1 ELSE 0 END) AS check_ins,
        SUM(CASE WHEN type = 'check_out' THEN 1 ELSE 0 END) AS exits,
        COUNT(DISTINCT CASE WHEN type = 'check_in' THEN user_id END) AS admitted
        FROM attendance_logs WHERE ${TODAY}`),
    ]);

    const todayRow = today.rows[0] || {};
    return NextResponse.json({
      registered: Number(registered.rows[0]?.count || 0),
      admins: Number(admins.rows[0]?.count || 0),
      inside_now: Number(inside.rows[0]?.count || 0),
      check_ins_today: Number(todayRow.check_ins || 0),
      exits_today: Number(todayRow.exits || 0),
      admitted_today: Number(todayRow.admitted || 0),
    });
  } catch (error) {
    console.error("Stats lookup failed:", error);
    return NextResponse.json({ error: "Unable to load dashboard statistics." }, { status: 500 });
  }
}
