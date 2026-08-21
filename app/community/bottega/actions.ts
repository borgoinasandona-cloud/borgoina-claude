"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugifyWithSuffix } from "@/lib/slugify";
import { parseShopFormData } from "@/lib/shops";
import { sendNewShopNotification } from "@/lib/resend";

export type ShopFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }
  return session.user;
}

export async function saveShopAction(
  _prevState: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  const user = await requireUser();

  const parsed = parseShopFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { images, ...data } = parsed.data;

  const existing = await prisma.shop.findUnique({ where: { authorId: user.id }, select: { id: true } });

  try {
    if (existing) {
      // Nessuna moderazione da re-innescare: il campo visibility non viene toccato dal salvataggio.
      await prisma.$transaction([
        prisma.shopImage.deleteMany({ where: { shopId: existing.id } }),
        prisma.shop.update({
          where: { id: existing.id },
          data: {
            ...data,
            images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
          },
        }),
      ]);
    } else {
      await prisma.shop.create({
        data: {
          ...data,
          slug: slugifyWithSuffix(data.name),
          authorId: user.id,
          images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
        },
      });

      try {
        await sendNewShopNotification({ shopName: data.name, ownerName: user.name ?? "Un iscritto" });
      } catch (error) {
        console.error("Notifica admin nuova bottega fallita:", error);
      }
    }
  } catch {
    return { status: "error", message: "Errore di salvataggio. Riprova." };
  }

  revalidatePath("/community/bottega");
  revalidatePath("/botteghe");
  redirect("/community/bottega");
}

export async function deleteMyShopAction() {
  const user = await requireUser();

  await prisma.shop.deleteMany({ where: { authorId: user.id } });

  revalidatePath("/community/bottega");
  revalidatePath("/botteghe");
}
