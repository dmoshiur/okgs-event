import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfig() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Add its credentials to the server environment.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export async function uploadImageFromBuffer(buffer, folder = "okgs/users") {
  ensureConfig();

  const transformations =
    folder === "okgs/branding"
      ? [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }]
      : [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }];

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: transformations,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url) {
            return reject(new Error("Cloudinary did not return an image URL."));
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export async function uploadImageFromBase64(base64String, folder = "okgs/users") {
  ensureConfig();
  const result = await cloudinary.uploader.upload(base64String, {
    folder,
    transformation:
      folder === "okgs/branding"
        ? [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }]
        : [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }],
  });
  return result.secure_url;
}

export async function uploadLogo(base64, type = "logo1") {
  ensureConfig();
  const result = await cloudinary.uploader.upload(base64, {
    folder: "okgs/branding",
    public_id: `${type}_${Date.now()}`,
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });
  return result.secure_url;
}

export { cloudinary };
