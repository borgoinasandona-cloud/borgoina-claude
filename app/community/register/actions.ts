"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export type RegisterState = {
  status: "idle" | "error";
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

  try {
    await signIn("credentials", { email, password, redirectTo: "/community" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account creato, ma l'accesso automatico è fallito: prova ad accedere manualmente.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
