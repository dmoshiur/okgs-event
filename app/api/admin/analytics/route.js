import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { CURRENT_STATE_CTE, toNumber } from "@/lib/attendance";

// Batch / SSC-year distribution with gate status for each batch.
export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.execute(`${CURRENT_STATE_CTE}
      SELECT
        COALESCE(NULLIF(TRIM(u.ssc_batch), ''), 'Unspecified') AS batch,
        COUNT(*) AS registered,
        SUM(CASE WHEN a.user_id IS NOT NULL THEN 1 ELSE 0 END) AS admitted,
        SUM(CASE WHEN cs.type = 'check_in' THEN 1 ELSE 0 END) AS inside,
        SUM(CASE WHEN cs.type = 'check_out' THEN 1 ELSE 0 END) AS exited
      FROM users u
      LEFT JOIN admitted a ON a.user_id = u.id
      LEFT JOIN current_state cs ON cs.user_id = u.id
      GROUP BY batch
      ORDER BY registered DESC, batch ASC`);

    const batches = result.rows.map((row) => ({
      batch: row.batch,
      registered: toNumber(row.registered),
      admitted: toNumber(row.admitted),
      inside: toNumber(row.inside),
      exited: toNumber(row.exited),
    }));

    const totals = batches.reduce(
      (sum, row) => ({
        registered: sum.registered + row.registered,
        admitted: sum.admitted + row.admitted,
        inside: sum.inside + row.inside,
        exited: sum.exited + row.exited,
      }),
      { registered: 0, admitted: 0, inside: 0, exited: 0 }
    );

    return NextResponse.json({ batches, totals });
  } catch (error) {
    console.error("Analytics lookup failed:", error);
    return NextResponse.json({ error: "Unable to load batch analytics." }, { status: 500 });
  }
}
