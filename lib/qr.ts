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

/** Data URL (PNG base64) del QR code identificativo di un utente, generato server-side. */
export function generateUserQrCode(userId: string) {
  return QRCode.toDataURL(signUserId(userId), { margin: 1, width: 240 });
}
