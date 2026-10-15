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

    const res = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [payload.id] });
    if (res.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
