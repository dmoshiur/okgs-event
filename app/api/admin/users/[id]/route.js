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

export async function GET(req, { params }) {
  await initDb();
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [params.id] });
  if (res.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(res.rows[0]);
}

export async function PUT(req, { params }) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const fields = ["name", "phone", "email", "division", "district", "upazila", "union_name", "institute", "ssc_batch", "photo_url"];
    const sets = [];
    const args = [];
    for (const f of fields) {
      if (body[f] !== undefined) {
        sets.push(`${f} = ?`);
        args.push(body[f]);
      }
    }
    if (sets.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    args.push(params.id);
    await db.execute({ sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`, args });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "superadmin") {
      // staff can delete too? allow but log
    }
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [params.id] });
    await db.execute({ sql: "DELETE FROM attendance_logs WHERE user_id = ?", args: [params.id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
