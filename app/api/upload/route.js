import { NextResponse } from "next/server";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import { verifyToken } from "@/lib/auth";

function getAuth(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/okgs_token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload) return null;
  return payload;
}

export async function POST(req) {
  try {
    const auth = getAuth(req);
    // Allow public for registration? We'll allow both, but for admin branding require admin
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder")?.toString() || "okgs/uploads";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageFromBuffer(buffer, folder);
    return NextResponse.json({ success: true, url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
