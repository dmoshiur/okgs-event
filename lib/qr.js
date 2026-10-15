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
  return await QRCode.toDataURL(text, opts);
}

export function generateUserCode() {
  const prefix = "OKGS";
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const time = Date.now().toString().slice(-4);
  return `${prefix}${year}${rand}${time}`;
}
