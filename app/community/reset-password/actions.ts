"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";
import { consumePasswordResetToken } from "@/lib/tokens";

export type ResetPasswordState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { token, password } = parsed.data;

  const email = await consumePasswordResetToken(token);
  if (!email) {
    return {
      status: "error",
      message: "Questo link non è valido o è scaduto. Richiedine uno nuovo dalla pagina di recupero password.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { status: "error", message: "Account non trovato." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      // Cliccare un link di reset ricevuto via email è di per sé una prova di possesso della
      // casella: se l'account non era ancora verificato (es. registrazione mai confermata),
      // questo passaggio la conferma senza bisogno di un secondo giro di email.
      emailVerified: user.emailVerified ?? new Date(),
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/community" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "success",
        message: "Password aggiornata. Accedi con la nuova password.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
