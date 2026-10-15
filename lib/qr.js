import { randomBytes } from "node:crypto";
import QRCode from "qrcode";

export async function generateQRDataUrl(text, options = {}) {
  const opts = {
    errorCorrectionLevel: "H",
    type: "image/png",
    margin: 2,
    width: 400,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    ...options,
  };
  return QRCode.toDataURL(text, opts);
}

export function generateUserCode() {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomCode = randomBytes(6).toString("hex").toUpperCase();
  return `OKGS${year}${randomCode}`;
}
