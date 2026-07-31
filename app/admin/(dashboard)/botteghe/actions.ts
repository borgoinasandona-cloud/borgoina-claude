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

export async function approveShopAction(id: string) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id },
    data: { visibility: "PUBLIC" },
  });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${shop.slug}`);
}

export async function rejectShopAction(id: string) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id },
    data: { visibility: "PRIVATE" },
  });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${shop.slug}`);
}

export async function deleteShopAction(id: string) {
  await requireAdmin();
  await prisma.shop.delete({ where: { id } });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
}
