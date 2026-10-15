import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    await initDb();
    const auth = getAuthFromRequest(request, "user");
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.execute({
      sql: `SELECT id, user_code, name, phone, email, division, district, upazila,
        union_name, institute, ssc_batch, photo_url, qr_code_url, created_at
        FROM users WHERE id = ?`,
      args: [auth.id],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("User profile lookup failed:", error);
    return NextResponse.json({ error: "Unable to load your profile." }, { status: 500 });
  }
}
