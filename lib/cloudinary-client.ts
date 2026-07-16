// Helper "client-safe": nessuna dipendenza dall'SDK Node di Cloudinary (lib/cloudinary.ts),
// così può essere importato da Client Component per costruire un'anteprima immagine.
export function cloudinaryPreviewUrl(publicId: string): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_limit/${publicId}`;
}
