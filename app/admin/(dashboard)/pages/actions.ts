"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pageSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import type { StaticPageSlug } from "@/lib/pages";

export type PageFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function savePageAction(
  slug: StaticPageSlug,
  _prevState: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { status: "error", message: "Non autorizzato." };
  }

  const parsed = pageSchema.safeParse({
    slug,
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await prisma.page.upsert({
    where: { slug },
    update: { title: parsed.data.title, content: parsed.data.content },
    create: { slug, title: parsed.data.title, content: parsed.data.content },
  });

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/pages/${slug}`);

  return { status: "success", message: "Pagina salvata." };
}
