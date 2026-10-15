const RESEND_API_URL = "https://api.resend.com/emails";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "OKGS Genesis <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, email will be mocked");
    return null;
  }
  return { apiKey, from };
}

function toInlineAttachment(qrDataUrl, user_code) {
  if (typeof qrDataUrl !== "string" || !qrDataUrl.startsWith("data:")) return null;
  const match = qrDataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  const [, mime, base64] = match;
  const ext = (mime.split("/")[1] || "png").split("+")[0];
  return {
    filename: `qr-${user_code}.${ext}`,
    content: base64,
    content_type: mime,
    content_id: "qr-code",
  };
}

export async function sendRegistrationEmail(to, { name, user_code, qrDataUrl, photoUrl }) {
  const cfg = getResendConfig();
  if (!cfg) {
    console.log(`[MOCK EMAIL] To: ${to} | User: ${name} | Code: ${user_code}`);
    return { mocked: true };
  }

  if (!to) {
    console.log(`[SKIP EMAIL] No recipient for ${user_code}`);
    return { skipped: true };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const attachment = toInlineAttachment(qrDataUrl, user_code);
  const qrSrc = attachment ? "cid:qr-code" : qrDataUrl || "";

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
        <img src="${qrSrc}" alt="QR Code" style="width:200px; height:200px; border: 4px solid #0f172a; border-radius: 12px;" />
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

  const payload = {
    from: cfg.from,
    to: [to],
    subject: `OKGS Event Pass - ${user_code} - ${name}`,
    html,
  };

  if (attachment) {
    payload.attachments = [attachment];
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Resend email failed:", data);
      return { error: data?.message || data?.error || res.statusText, mocked: true };
    }
    return data;
  } catch (e) {
    console.error("Email send failed:", e);
    return { error: e.message, mocked: true };
  }
}
