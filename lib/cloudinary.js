import { v2 as cloudinary } from "cloudinary";

let configured = false;
function ensureConfig() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret });
    configured = true;
  }
}

export async function uploadImageFromBuffer(buffer, folder = "okgs/users") {
  ensureConfig();
  // If demo credentials, return placeholder
  if (!configured) {
    // Return a placeholder image URL with base64 fallback
    // We'll still try to create a data URI for demo
    const base64 = buffer.toString("base64");
    // For demo, return data uri limited, but use postimg fallback for listing
    // In production with real creds, this will upload
    return `https://res.cloudinary.com/demo/image/upload/v1/okgs/placeholder-user.jpg`;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export async function uploadImageFromBase64(base64String, folder = "okgs/users") {
  ensureConfig();
  if (!configured) {
    return `https://res.cloudinary.com/demo/image/upload/v1/okgs/placeholder-user.jpg`;
  }
  const res = await cloudinary.uploader.upload(base64String, {
    folder,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });
  return res.secure_url;
}

export async function uploadLogo(base64, type = "logo1") {
  ensureConfig();
  if (!configured) {
    // Return input if demo
    return base64.slice(0, 200);
  }
  const res = await cloudinary.uploader.upload(base64, {
    folder: "okgs/branding",
    public_id: type + "_" + Date.now(),
  });
  return res.secure_url;
}

export { cloudinary };
