"use server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/resend";
import { siteConfig } from "@/lib/site-config";

export type ResendVerificationState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const GENERIC_MESSAGE =
  "Se l'indirizzo è registrato e non ancora verificato, ti abbiamo inviato un nuovo link di conferma.";

export async function resendVerificationAction(
  _prevState: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Email non valida." };
  }

  const { email } = parsed.data;

  // Risposta identica indipendentemente dal fatto che l'account esista o sia già verificato,
  // per non rivelare a chi non è iscritto quali email sono registrate (stesso principio usato
  // nel recupero password).
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.password && !user.emailVerified) {
    const token = await createEmailVerificationToken(email);
    await sendVerificationEmail({
      to: email,
      name: user.name ?? email,
      url: `${siteConfig.url}/community/verify-email?token=${token}`,
    });
  }

  return { status: "success", message: GENERIC_MESSAGE };
}
