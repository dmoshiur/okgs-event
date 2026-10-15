import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";
let smtpTransport;
let smtpTransportKey;

function htmlEscape(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  const key = `${host}:${port}:${secure}:${user || ""}`;

  if (!smtpTransport || smtpTransportKey !== key) {
    smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: user ? { user, pass: password || "" } : undefined,
    });
    smtpTransportKey = key;
  }

  return smtpTransport;
}

function getSender() {
  return (
    process.env.MAIL_FROM ||
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "Omar Kindergarten School <onboarding@resend.dev>"
  );
}

function toDataUrlAttachment(dataUrl, filename) {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;

  return {
    filename,
    contentType: match[1],
    content: Buffer.from(match[2], "base64"),
    cid: "qr-code",
  };
}

async function deliverMail({ to, subject, html, attachments = [] }) {
  if (!to) return { skipped: true, reason: "no_recipient" };

  const sender = getSender();
  const smtp = getSmtpTransport();
  if (smtp) {
    const info = await smtp.sendMail({
      from: sender,
      to,
      subject,
      html,
      attachments,
    });
    return { sent: true, messageId: info.messageId };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const payload = {
      from: sender,
      to: [to],
      subject,
      html,
    };
    if (attachments.length) {
      payload.attachments = attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
        content_type: attachment.contentType,
        content_id: attachment.cid,
      }));
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(responseData?.message || responseData?.error || "Email provider rejected the message.");
    }
    return { sent: true, id: responseData.id };
  }

  console.warn("No SMTP or Resend configuration is available; email was not sent.");
  return { skipped: true, reason: "not_configured" };
}

export async function sendRegistrationEmail(
  to,
  { name, user_code, qrDataUrl, eventTitle, schoolName } = {}
) {
  if (!to) return { skipped: true, reason: "no_recipient" };

  const safeName = htmlEscape(name || "attendee");
  const safeCode = htmlEscape(user_code || "");
  const safeEventTitle = htmlEscape(eventTitle || "School Event");
  const safeSchoolName = htmlEscape(schoolName || "Omar Kindergarten School");
  const attachment = toDataUrlAttachment(qrDataUrl, `qr-pass-${safeCode}.png`);
  const qrImage = attachment ? '<img src="cid:qr-code" alt="Your event QR pass" width="190" height="190" style="display:block;width:190px;height:190px;margin:auto;border:8px solid #fff;border-radius:12px" />' : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${appUrl.replace(/\/$/, "")}/login`;

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#172033;border:1px solid #e7eaf0;border-radius:16px;overflow:hidden">
      <div style="background:#111827;color:#fff;padding:24px;text-align:center">
        <p style="margin:0 0 8px;color:#fbbf24;font-size:12px;letter-spacing:2px;text-transform:uppercase">${safeSchoolName}</p>
        <h1 style="margin:0;font-size:22px">Your event pass is ready</h1>
      </div>
      <div style="padding:24px">
        <p>Hello ${safeName},</p>
        <p>Your registration for <strong>${safeEventTitle}</strong> is confirmed.</p>
        <p><strong>Registration code:</strong> ${safeCode}</p>
        ${qrImage}
        <p style="text-align:center;color:#64748b;font-size:13px">The QR pass is also attached to this email.</p>
        <p>Show this pass at the gate. You can sign in with your phone number and password to retrieve it later.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${htmlEscape(loginUrl)}" style="display:inline-block;background:#fbbf24;color:#111827;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Open event portal</a>
        </p>
      </div>
    </div>
  `;

  return deliverMail({
    to,
    subject: `${safeSchoolName} event pass — ${safeCode}`,
    html,
    attachments: attachment ? [attachment] : [],
  });
}

export async function sendPasswordResetEmail(to, { name, resetUrl } = {}) {
  if (!to) return { skipped: true, reason: "no_recipient" };

  const safeName = htmlEscape(name || "there");
  const safeUrl = htmlEscape(resetUrl || "");
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;color:#172033;border:1px solid #e7eaf0;border-radius:16px;overflow:hidden">
      <div style="background:#111827;color:#fff;padding:22px 24px">
        <p style="margin:0;color:#fbbf24;font-size:12px;letter-spacing:2px;text-transform:uppercase">Omar Kindergarten School</p>
        <h1 style="margin:8px 0 0;font-size:21px">Reset your password</h1>
      </div>
      <div style="padding:24px">
        <p>Hello ${safeName},</p>
        <p>We received a request to reset the password for your event portal account. This link expires in 30 minutes and can only be used once.</p>
        <p style="text-align:center;margin:26px 0">
          <a href="${safeUrl}" style="display:inline-block;background:#fbbf24;color:#111827;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Choose a new password</a>
        </p>
        <p style="font-size:12px;color:#64748b">If you did not request a reset, you can ignore this email. Your current password will remain unchanged.</p>
      </div>
    </div>
  `;

  return deliverMail({
    to,
    subject: "Reset your school event portal password",
    html,
  });
}
