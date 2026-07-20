"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { updateAccountSchema } from "@/lib/validations";

export type UpdateAccountState = {
  status: "idle" | "error" | "success";
  message?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }
  return session.user;
}

export async function updateAccountAction(
  _prevState: UpdateAccountState,
  formData: FormData,
): Promise<UpdateAccountState> {
  const user = await requireUser();

  const parsed = updateAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword") || "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.password) {
    return { status: "error", message: "Account non valido." };
  }

  const passwordValid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!passwordValid) {
    return { status: "error", message: "Password attuale errata." };
  }

  if (email !== dbUser.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { status: "error", message: "Esiste già un account con questa email." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });

  revalidatePath("/community/account");
  return { status: "success", message: "Dati aggiornati." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/community" });
}
