import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

// Converts a display number such as "+880 1709-202140" into dialable and WhatsApp forms.
export function toDialNumber(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export function toWhatsAppNumber(phone) {
  return toDialNumber(phone).replace(/\D/g, "");
}

export default function SupportContact({ phone, className = "" }) {
  const number = phone || DEFAULT_SUPPORT_PHONE;
  const dial = toDialNumber(number);
  const whatsapp = toWhatsAppNumber(number);

  return (
    <p className={className}>
      For technical help or query, contact:{" "}
      <a href={`tel:${dial}`} className="font-bold underline-offset-4 hover:underline">
        {number}
      </a>{" "}
      (
      <a href={`tel:${dial}`} className="underline-offset-4 hover:underline">
        Call
      </a>
      /
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 hover:underline"
      >
        WhatsApp
      </a>
      )
    </p>
  );
}
