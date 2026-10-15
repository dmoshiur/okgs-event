import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

function getAuth(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/okgs_token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload || payload.type !== "admin") return null;
  return payload;
}

export async function DELETE(req, { params }) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "superadmin") return NextResponse.json({ error: "Only superadmin" }, { status: 403 });
    if (String(auth.id) === String(params.id)) return NextResponse.json({ error: "Cannot delete self" }, { status: 400 });
    await db.execute({ sql: "DELETE FROM admins WHERE id = ?", args: [params.id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "superadmin") return NextResponse.json({ error: "Only superadmin" }, { status: 403 });
    const body = await req.json();
    const sets = [];
    const args = [];
    if (body.username) { sets.push("username = ?"); args.push(body.username); }
    if (body.email) { sets.push("email = ?"); args.push(body.email); }
    if (body.role) { sets.push("role = ?"); args.push(body.role); }
    if (body.password) { sets.push("password_hash = ?"); args.push(await hashPassword(body.password)); }
    if (sets.length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    args.push(params.id);
    await db.execute({ sql: `UPDATE admins SET ${sets.join(", ")} WHERE id = ?`, args });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
