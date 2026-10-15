import "./globals.css";
import { initDb } from "@/lib/db";

export const metadata = {
  title: "OKGS Genesis Platform | Event Management & Attendance",
  description: "OKGS Genesis Grand Event - Registration, Pass, Attendance System. Lightweight, fast, and responsive.",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }) {
  // Ensure DB is initialized on server start
  try {
    await initDb();
  } catch (e) {
    console.error("DB init error", e);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
