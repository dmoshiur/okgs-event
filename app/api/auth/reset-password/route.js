import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

function invalidLinkResponse() {
  return NextResponse.json(
    { error: "This reset link is invalid or expired. Request a new one." },
    { status: 400 }
  );
}

export async function POST(request) {
  let transaction;
  try {
    await initDb();
    const body = await request.json();
    const token = String(body?.token || "");
    const password = String(body?.password || "");
    if (!token || token.length > 200) return invalidLinkResponse();
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and no more than 72 bytes." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const existing = await db.execute({
      sql: "SELECT account_type, account_id, expires_at FROM password_resets WHERE token_hash = ? AND used_at IS NULL",
      args: [tokenHash],
    });
    const reset = existing.rows[0];
    if (!reset || Date.parse(reset.expires_at) <= Date.now()) return invalidLinkResponse();

    const passwordHash = await hashPassword(password);
    transaction = await db.transaction("write");
    const current = await transaction.execute({
      sql: "SELECT account_type, account_id, expires_at FROM password_resets WHERE token_hash = ? AND used_at IS NULL",
      args: [tokenHash],
    });
    const row = current.rows[0];
    if (!row || Date.parse(row.expires_at) <= Date.now()) {
      await transaction.rollback();
      return invalidLinkResponse();
    }

    const table = row.account_type === "admin" ? "admins" : "users";
    const update = await transaction.execute({
      sql: `UPDATE ${table} SET password_hash = ? WHERE id = ?`,
      args: [passwordHash, row.account_id],
    });
    if (Number(update.rowsAffected) !== 1) {
      await transaction.rollback();
      return invalidLinkResponse();
    }

    await transaction.execute({
      sql: "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ?",
      args: [tokenHash],
    });
    await transaction.commit();
    transaction = null;

    return NextResponse.json({ success: true, message: "Your password has been changed. Sign in with the new password." });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "Unable to reset the password right now." }, { status: 500 });
  }
}
