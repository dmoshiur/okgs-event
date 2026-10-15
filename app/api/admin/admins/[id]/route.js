import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest, hashPassword } from "@/lib/auth";

async function getAdminId(context) {
  const params = await context.params;
  return String(params.id || "");
}

async function requireSuperadmin(request) {
  const auth = await getAdminFromRequest(request);
  if (!auth) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (auth.role !== "superadmin") {
    return { error: NextResponse.json({ error: "Only a super-admin can manage accounts." }, { status: 403 }) };
  }
  return { auth };
}

export async function DELETE(request, context) {
  try {
    await initDb();
    const { auth, error } = await requireSuperadmin(request);
    if (error) return error;

    const id = await getAdminId(context);
    if (String(auth.id) === id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }
    const targetResult = await db.execute({
      sql: "SELECT id, role FROM admins WHERE id = ?",
      args: [id],
    });
    const target = targetResult.rows[0];
    if (!target) return NextResponse.json({ error: "Administrator not found." }, { status: 404 });

    if (target.role === "superadmin") {
      const count = await db.execute("SELECT COUNT(*) AS count FROM admins WHERE role = 'superadmin'");
      if (Number(count.rows[0]?.count || 0) <= 1) {
        return NextResponse.json({ error: "At least one super-admin account must remain." }, { status: 400 });
      }
    }

    await db.execute({ sql: "DELETE FROM admins WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Administrator deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete administrator." }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await initDb();
    const { error } = await requireSuperadmin(request);
    if (error) return error;

    const id = await getAdminId(context);
    const targetResult = await db.execute({ sql: "SELECT id, role FROM admins WHERE id = ?", args: [id] });
    const target = targetResult.rows[0];
    if (!target) return NextResponse.json({ error: "Administrator not found." }, { status: 404 });

    const body = await request.json();
    if (target.role === "superadmin" && body.role === "staff") {
      const count = await db.execute("SELECT COUNT(*) AS count FROM admins WHERE role = 'superadmin'");
      if (Number(count.rows[0]?.count || 0) <= 1) {
        return NextResponse.json({ error: "At least one super-admin account must remain." }, { status: 400 });
      }
    }
    const fields = [];
    const args = [];

    if (body.username !== undefined) {
      const username = String(body.username).trim();
      if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
        return NextResponse.json({ error: "Enter a valid username." }, { status: 400 });
      }
      fields.push("username = ?");
      args.push(username);
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      fields.push("email = ?");
      args.push(email);
    }
    if (body.role !== undefined) {
      if (!["staff", "superadmin"].includes(body.role)) {
        return NextResponse.json({ error: "Choose a valid administrator role." }, { status: 400 });
      }
      fields.push("role = ?");
      args.push(body.role);
    }
    if (body.password !== undefined && body.password !== "") {
      const password = String(body.password);
      if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        return NextResponse.json({ error: "Password must be at least 8 characters and no more than 72 bytes." }, { status: 400 });
      }
      fields.push("password_hash = ?");
      args.push(await hashPassword(password));
    }

    if (fields.length === 0) return NextResponse.json({ error: "No changes to save." }, { status: 400 });
    args.push(id);
    await db.execute({ sql: `UPDATE admins SET ${fields.join(", ")} WHERE id = ?`, args });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "That username or email is already in use." }, { status: 409 });
    }
    console.error("Administrator update failed:", error);
    return NextResponse.json({ error: "Unable to update administrator." }, { status: 500 });
  }
}
