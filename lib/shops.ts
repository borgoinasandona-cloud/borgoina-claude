import { prisma } from "@/lib/prisma";
import type { ShopCategory } from "@prisma/client";

export const shopCategoryLabels: Record<ShopCategory, string> = {
  CRAFTS: "Artigianato",
  SHOP: "Negozio",
  FOOD: "Ristorazione e alimentari",
  SERVICES: "Servizi",
  OTHER: "Altro",
};

const shopInclude = {
  author: { select: { id: true, name: true, email: true } },
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

export function getAllShopsForAdmin() {
  return prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: shopInclude,
  });
}
