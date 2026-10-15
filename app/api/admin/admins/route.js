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

export async function GET(req) {
  await initDb();
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await db.execute("SELECT id, username, email, role, created_at FROM admins ORDER BY created_at DESC");
  return NextResponse.json({ admins: res.rows });
}

export async function POST(req) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "superadmin") return NextResponse.json({ error: "Only superadmin can create admins" }, { status: 403 });

    const { username, email, password, role } = await req.json();
    if (!username || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const hash = await hashPassword(password);
    const result = await db.execute({
      sql: "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: [username, email, hash, role || "staff"],
    });
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (e) {
    if (e.message.includes("UNIQUE")) return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
