import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

// Riusa la tabella VerificationToken standard di Auth.js (mai usata per il provider Credentials)
// per i link "una tantum" di verifica email e reset password. Le due categorie condividono la
// tabella ma restano distinguibili dal prefisso del token — non serve un modello dedicato.
const EMAIL_VERIFY_PREFIX = "ev_";
const PASSWORD_RESET_PREFIX = "pr_";

const EMAIL_VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60; // 1h

function randomToken(prefix: string) {
  return `${prefix}${crypto.randomBytes(32).toString("hex")}`;
}

export async function createEmailVerificationToken(email: string) {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email, token: { startsWith: EMAIL_VERIFY_PREFIX } },
  });
  const token = randomToken(EMAIL_VERIFY_PREFIX);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + EMAIL_VERIFY_TTL_MS) },
  });
  return token;
}

/**
 * Valida il token, marca l'email come verificata e lo consuma (una tantum). Ritorna l'email
 * se andato a buon fine, null se il token è mancante/scaduto/già usato.
 */
export async function consumeEmailVerificationToken(token: string) {
  if (!token.startsWith(EMAIL_VERIFY_PREFIX)) return null;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  if (record.expires < new Date()) return null;

  await prisma.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  return record.identifier;
}

export async function createPasswordResetToken(email: string) {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email, token: { startsWith: PASSWORD_RESET_PREFIX } },
  });
  const token = randomToken(PASSWORD_RESET_PREFIX);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  });
  return token;
}

/** Controlla se un token di reset è valido senza consumarlo (per decidere cosa mostrare in pagina). */
export async function peekPasswordResetToken(token: string) {
  if (!token.startsWith(PASSWORD_RESET_PREFIX)) return null;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) return null;
  return record.identifier;
}

/** Consuma il token di reset (va chiamato solo dopo aver validato la nuova password). */
export async function consumePasswordResetToken(token: string) {
  const email = await peekPasswordResetToken(token);
  if (!email) return null;
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  return email;
}
