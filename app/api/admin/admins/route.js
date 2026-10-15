import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest, hashPassword } from "@/lib/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await db.execute(
      "SELECT id, username, email, role, created_at FROM admins ORDER BY created_at DESC"
    );
    return NextResponse.json({ admins: result.rows });
  } catch (error) {
    console.error("Admin directory lookup failed:", error);
    return NextResponse.json({ error: "Unable to load administrators." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "superadmin") {
      return NextResponse.json({ error: "Only a super-admin can create accounts." }, { status: 403 });
    }

    const body = await request.json();
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "staff");

    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3–40 letters, numbers, dots, underscores, or hyphens." }, { status: 400 });
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json({ error: "Password must be at least 8 characters and no more than 72 bytes." }, { status: 400 });
    }
    if (!["staff", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Choose a valid administrator role." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const result = await db.execute({
      sql: "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: [username, email, passwordHash, role],
    });
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "That username or email is already in use." }, { status: 409 });
    }
    console.error("Administrator creation failed:", error);
    return NextResponse.json({ error: "Unable to create administrator." }, { status: 500 });
  }
}
