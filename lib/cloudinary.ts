import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UPLOAD_FOLDER = "borgoina";

/**
 * Firma una richiesta di upload lato client: evita di esporre CLOUDINARY_API_SECRET
 * e di far transitare i file dal nostro server.
 */
export function createUploadSignature() {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: UPLOAD_FOLDER };

  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET non configurata");
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    timestamp,
    signature,
    folder: UPLOAD_FOLDER,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/** Costruisce l'URL di visualizzazione a partire da un public_id salvato in DB (es. Post.coverImage). */
export function cloudinaryUrl(publicId: string, options: Record<string, unknown> = {}) {
  return cloudinary.url(publicId, { secure: true, ...options });
}

export { cloudinary };
