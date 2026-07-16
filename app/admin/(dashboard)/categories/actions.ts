"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export type CategoryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { status: "error", message: "Categoria già esistente (nome o slug duplicato)." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/news");

  return { status: "success", message: "Categoria creata." };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/news");
}
