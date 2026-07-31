"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shopSchema } from "@/lib/validations";
import { slugifyWithSuffix } from "@/lib/slugify";

export type ShopFormState = {
  status: "idle" | "error";
  message?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }
  return session.user;
}

function parseShopFormData(formData: FormData) {
  const imagesRaw = formData.get("imagesJson");
  let images: unknown[] = [];
  if (typeof imagesRaw === "string" && imagesRaw.length > 0) {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = [];
    }
  }

  return shopSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    slogan: formData.get("slogan") || "",
    description: formData.get("description"),
    history: formData.get("history") || "",
    whyChooseUs: formData.get("whyChooseUs") || "",
    address: formData.get("address") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    website: formData.get("website") || "",
    instagram: formData.get("instagram") || "",
    hours: formData.get("hours") || "",
    coverImage: formData.get("coverImage") || "",
    images,
  });
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
