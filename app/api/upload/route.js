import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { uploadImageFromBuffer } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Logo images must be smaller than 5 MB." }, { status: 400 });
    }

    const folder = formData.get("folder")?.toString() || "okgs/branding";
    if (folder !== "okgs/branding") {
      return NextResponse.json({ error: "Only school branding assets can be uploaded here." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageFromBuffer(buffer, folder);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image upload failed:", error);
    const status = error.message?.includes("Cloudinary is not configured") ? 503 : 500;
    return NextResponse.json(
      { error: status === 503 ? error.message : "Unable to upload this image." },
      { status }
    );
  }
}
