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
};

export default async function RootLayout({ children }) {
  try {
    await initDb();
  } catch (error) {
    console.error("Database initialization error:", error);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
