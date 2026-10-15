import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP not configured, email will be mocked");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendRegistrationEmail(to, { name, user_code, qrDataUrl, photoUrl }) {
  const trans = getTransporter();
  if (!trans) {
    console.log(`[MOCK EMAIL] To: ${to} | User: ${name} | Code: ${user_code}`);
    return { mocked: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
    <div style="background: #0f172a; color: white; padding: 24px; text-align: center;">
      <h1 style="margin:0; font-size: 22px;">OKGS Genesis Platform</h1>
      <p style="margin:8px 0 0; opacity:0.8;">Event Registration Confirmed</p>
    </div>
    <div style="padding: 24px;">
      <h2 style="color:#0f172a;">Hello ${name},</h2>
      <p>Your registration for <strong>OKGS Genesis Event</strong> is confirmed!</p>
      <p><strong>Registration ID:</strong> ${user_code}</p>
      <p style="text-align:center; margin: 24px 0;">
        <img src="${qrDataUrl}" alt="QR Code" style="width:200px; height:200px; border: 4px solid #0f172a; border-radius: 12px;" />
      </p>
      <p>Please bring this QR code (printed or on phone) to the event gate. You can also login at <a href="${appUrl}/login">${appUrl}/login</a> to download your pass.</p>
      <p style="margin-top: 24px;">
        <a href="${appUrl}/dashboard" style="background:#f59e0b; color:#000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View My Pass</a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #666;">This is an automated email. If you did not register, please ignore.</p>
    </div>
  </div>
  `;

  try {
    const info = await trans.sendMail({
      from,
      to,
      subject: `OKGS Event Pass - ${user_code} - ${name}`,
      html,
    });
    return info;
  } catch (e) {
    console.error("Email send failed:", e);
    return { error: e.message, mocked: true };
  }
}
