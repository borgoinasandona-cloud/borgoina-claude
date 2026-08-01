import { prisma } from "@/lib/prisma";
import type { ShopCategory } from "@prisma/client";
import { shopSchema } from "@/lib/validations";

export const shopCategoryLabels: Record<ShopCategory, string> = {
  CRAFTS: "Artigianato",
  SHOP: "Negozio",
  FOOD: "Ristorazione e alimentari",
  SERVICES: "Servizi",
  OTHER: "Altro",
};

const shopInclude = {
  author: { select: { id: true, name: true, email: true, image: true } },
  images: { orderBy: { order: "asc" } },
} as const;

export function getPublicShops({ category }: { category?: ShopCategory } = {}) {
  return prisma.shop.findMany({
    where: {
      visibility: "PUBLIC",
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: shopInclude,
  });
}

export function getShopBySlug(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: shopInclude,
  });
}

export function getShopByAuthorId(authorId: string) {
  return prisma.shop.findUnique({
    where: { authorId },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export function getShopByIdForAdmin(id: string) {
  return prisma.shop.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      images: { orderBy: { order: "asc" } },
    },
  });
}

export function getAllShopsForAdmin() {
  return prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: shopInclude,
  });
}

/**
 * Utenti collegabili a una bottega dall'admin: chi non ne ha già una (authorId è @unique, un
 * utente può gestirne al massimo una), più eventualmente l'utente già collegato alla bottega che
 * si sta modificando (altrimenti sparirebbe dalla select mentre la si guarda).
 */
export function getAssignableUsers(currentAuthorId?: string | null) {
  return prisma.user.findMany({
    where: {
      OR: [{ shop: null }, ...(currentAuthorId ? [{ id: currentAuthorId }] : [])],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

// Parsing condiviso del form Bottega: usato sia da saveShopAction (l'iscritto salva la propria)
// sia da adminUpdateShopAction (l'admin modifica quella di un altro) — stesso set di campi in
// entrambi i casi. Vive qui (non in un file "use server") perché è una funzione sync: un file con
// "use server" in cima richiede che ogni export sia una funzione async.
export function parseShopFormData(formData: FormData) {
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
    ownerName: formData.get("ownerName") || "",
    images,
  });
}
