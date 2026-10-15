import "./globals.css";
import { initDb } from "@/lib/db";

export const metadata = {
  title: "Omar Kindergarten School | Event & Attendance Portal",
  description:
    "Omar Kindergarten School event registration, attendee passes, and live attendance management.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081527",
};

export default async function RootLayout({ children }) {
  try {
    await initDb();
  } catch (error) {
    console.error("Database initialization error:", error);
  }

  return (
    <html lang="en">
      <head>
        {/* Theme typography: Fraunces (editorial display), Inter (UI), Hind Siliguri (Bangla notices),
            plus the royal academic serifs — Cinzel over Playfair Display — used by the school wordmark. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout loads the
            theme fonts once for the whole application; next/font would require build-time network access. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@300..800&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-paper text-[#1b2430] antialiased">{children}</body>
    </html>
  );
}
