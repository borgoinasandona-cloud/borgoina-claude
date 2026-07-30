"use server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/resend";
import { siteConfig } from "@/lib/site-config";

export type ForgotPasswordState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const GENERIC_MESSAGE = "Se l'indirizzo è registrato, ti abbiamo inviato un link per reimpostare la password.";

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Email non valida." };
  }

  const { email } = parsed.data;

  // Stesso messaggio generico indipendentemente dall'esito, per non rivelare quali email
  // sono registrate.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createPasswordResetToken(email);
    await sendPasswordResetEmail({
      to: email,
      name: user.name ?? email,
      url: `${siteConfig.url}/community/reset-password?token=${token}`,
    });
  }

  return { status: "success", message: GENERIC_MESSAGE };
}
