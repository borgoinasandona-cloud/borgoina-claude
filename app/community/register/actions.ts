"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, sendNewMemberNotification } from "@/lib/resend";
import { siteConfig } from "@/lib/site-config";

export type RegisterState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { status: "error", message: "Esiste già un account con questa email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: passwordHash, role: "MEMBER" },
  });

  const token = await createEmailVerificationToken(email);
  await sendVerificationEmail({
    to: email,
    name,
    url: `${siteConfig.url}/community/verify-email?token=${token}`,
  });

  try {
    await sendNewMemberNotification({ name, email });
  } catch (error) {
    console.error("Notifica admin nuovo iscritto fallita:", error);
  }

  return {
    status: "success",
    message: "Account creato. Controlla la tua casella email e clicca sul link di conferma per attivarlo.",
  };
}
