// Helper "client-safe": nessuna dipendenza dall'SDK Node di Cloudinary (lib/cloudinary.ts),
// così può essere importato da Client Component per costruire un'anteprima immagine.
export function cloudinaryPreviewUrl(publicId: string): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_limit/${publicId}`;
}

/**
 * Inserisce una trasformazione in un URL di consegna Cloudinary già completo (es. quelli
 * incollati come <img src> nel contenuto HTML di Page/Post, salvati come secure_url intero e
 * non come public_id) — usato per chiedere a Cloudinary il formato/qualità migliori invece di
 * ri-costruire l'URL da zero. Se l'URL non è un URL di consegna Cloudinary riconoscibile, lo
 * restituisce invariato.
 */
export function withCloudinaryTransform(url: string, transformation: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transformation}/`);
}
