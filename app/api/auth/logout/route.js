import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("okgs_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
export async function GET() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("okgs_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
