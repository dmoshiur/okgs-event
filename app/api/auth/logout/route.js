import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  return clearAuthCookie(NextResponse.json({ success: true }));
}

export async function GET() {
  return clearAuthCookie(NextResponse.json({ success: true }));
}
