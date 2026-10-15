import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_MESSAGE =
  "If an account matches those details and has an email address, a reset link will be sent shortly.";

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const identifier = String(body?.identifier || "").trim();
    if (!identifier || identifier.length > 254) {
      return NextResponse.json({ error: "Enter your phone number, email, or staff username." }, { status: 400 });
    }

    const emailIdentifier = identifier.toLowerCase();
    const adminResult = await db.execute({
      sql: "SELECT id, email, username FROM admins WHERE lower(email) = ? OR username = ? LIMIT 1",
      args: [emailIdentifier, identifier],
    });

    let account = adminResult.rows[0]
      ? { ...adminResult.rows[0], account_type: "admin", name: adminResult.rows[0].username }
      : null;

    if (!account) {
      const userResult = await db.execute({
        sql: "SELECT id, email, name FROM users WHERE phone = ? OR lower(email) = ? LIMIT 1",
        args: [identifier, emailIdentifier],
      });
      if (userResult.rows[0]) {
        account = { ...userResult.rows[0], account_type: "user" };
      }
    }

    if (account?.email) {
      const recentRequest = await db.execute({
        sql: `SELECT id FROM password_resets
          WHERE account_type = ? AND account_id = ?
          AND created_at >= datetime('now', '-1 minute') LIMIT 1`,
        args: [account.account_type, account.id],
      });

      if (recentRequest.rows.length === 0) {
        const rawToken = randomBytes(32).toString("base64url");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        await db.execute({
          sql: "DELETE FROM password_resets WHERE account_type = ? AND account_id = ? AND used_at IS NULL",
          args: [account.account_type, account.id],
        });
        await db.execute({
          sql: `INSERT INTO password_resets (account_type, account_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)`,
          args: [account.account_type, account.id, tokenHash, expiresAt],
        });

        const appUrl = (
          process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
        ).replace(/\/$/, "");
        const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
        try {
          await sendPasswordResetEmail(account.email, { name: account.name, resetUrl });
        } catch (error) {
          console.error("Password reset email failed:", error);
        }
      }
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json({ error: "Unable to process the request right now." }, { status: 500 });
  }
}
