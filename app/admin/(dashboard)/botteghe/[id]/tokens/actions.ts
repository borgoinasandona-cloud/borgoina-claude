"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

export type TokenFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function createTokenAction(
  shopId: string,
  _prevState: TokenFormState,
  formData: FormData,
): Promise<TokenFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;
  const totalIssued = Number(formData.get("totalIssued"));

  if (!title) {
    return { status: "error", message: "Il titolo dell'offerta è obbligatorio." };
  }
  if (title.length > 200) {
    return { status: "error", message: "Il titolo è troppo lungo (max 200 caratteri)." };
  }
  if (!Number.isInteger(totalIssued) || totalIssued < 1) {
    return { status: "error", message: "La quantità deve essere un numero intero positivo." };
  }

  await prisma.discountToken.create({ data: { shopId, title, description, totalIssued } });

  revalidatePath(`/admin/botteghe/${shopId}/tokens`);
  return { status: "success", message: "Token creato." };
}

export async function toggleActiveAction(shopId: string, tokenId: string) {
  await requireAdmin();

  const token = await prisma.discountToken.findUnique({ where: { id: tokenId } });
  if (!token || token.shopId !== shopId) {
    throw new Error("Token non trovato per questa bottega.");
  }

  await prisma.discountToken.update({ where: { id: tokenId }, data: { active: !token.active } });
  revalidatePath(`/admin/botteghe/${shopId}/tokens`);
}
