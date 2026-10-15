import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { CURRENT_STATE_CTE, TODAY_FILTER, toNumber } from "@/lib/attendance";

export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [registered, gate, today] = await Promise.all([
      db.execute("SELECT COUNT(*) AS count FROM users"),
      db.execute(`${CURRENT_STATE_CTE}
        SELECT
          (SELECT COUNT(*) FROM admitted) AS admitted,
          SUM(CASE WHEN cs.type = 'check_in' THEN 1 ELSE 0 END) AS inside,
          SUM(CASE WHEN cs.type = 'check_out' THEN 1 ELSE 0 END) AS exited
        FROM current_state cs`),
      db.execute(`SELECT
        SUM(CASE WHEN type = 'check_in' THEN 1 ELSE 0 END) AS check_ins,
        SUM(CASE WHEN type = 'check_out' THEN 1 ELSE 0 END) AS exits,
        COUNT(DISTINCT CASE WHEN type = 'check_in' THEN user_id END) AS admitted
        FROM attendance_logs WHERE ${TODAY_FILTER}`),
    ]);

    const gateRow = gate.rows[0] || {};
    const todayRow = today.rows[0] || {};
    const registeredCount = toNumber(registered.rows[0]?.count);

    return NextResponse.json({
      registered: registeredCount,
      admitted_at_gate: toNumber(gateRow.admitted),
      not_yet_admitted: Math.max(0, registeredCount - toNumber(gateRow.admitted)),
      inside_now: toNumber(gateRow.inside),
      exited_now: toNumber(gateRow.exited),
      check_ins_today: toNumber(todayRow.check_ins),
      exits_today: toNumber(todayRow.exits),
      admitted_today: toNumber(todayRow.admitted),
    });
  } catch (error) {
    console.error("Stats lookup failed:", error);
    return NextResponse.json({ error: "Unable to load dashboard statistics." }, { status: 500 });
  }
}
