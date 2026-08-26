import crypto from "node:crypto";
import QRCode from "qrcode";

function getSecret() {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error("QR_SECRET non configurata");
  }
  return secret;
}

function sign(userId: string) {
  return crypto.createHmac("sha256", getSecret()).update(userId).digest("hex");
}

/** userId + firma HMAC-SHA256, come stringa unica da codificare nel QR. */
export function signUserId(userId: string) {
  return `${userId}.${sign(userId)}`;
}

/**
 * Verifica una stringa "userId.firma" prodotta da signUserId(). Confronto a tempo costante con
 * crypto.timingSafeEqual per non esporre un timing attack sulla firma (richiede buffer della
 * stessa lunghezza, controllata prima per evitare che lanci un'eccezione su firme malformate).
 */
export function verifySignedUserId(value: string): string | null {
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;

  const expected = sign(userId);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return userId;
}

/** Data URL (PNG base64) del QR code identificativo di un utente, generato server-side. */
export function generateUserQrCode(userId: string) {
  return QRCode.toDataURL(signUserId(userId), { margin: 1, width: 240 });
}
