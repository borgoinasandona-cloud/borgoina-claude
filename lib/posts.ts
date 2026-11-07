import { prisma } from "@/lib/prisma";

export function hasGallery(post: { externalLink: string | null; _count: { images: number } }) {
  return post._count.images > 0 || Boolean(post.externalLink);
}

export function getPublishedPosts({ categorySlug }: { categorySlug?: string } = {}) {
  return prisma.post.findMany({
    where: {
      visibility: "PUBLIC",
      publishedAt: { not: null, lte: new Date() },
      ...(categorySlug ? { categories: { some: { slug: categorySlug } } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: { categories: true, _count: { select: { images: true } } },
  });
}

// excludeFeatured: usato dalla home (vedi app/page.tsx) per non ripetere negli "Ultimi articoli"
// quelli già mostrati per intero nel blocco "Il Borgo utile" (getFeaturedPosts) — altrove
// (se mai servisse) il default false restituisce semplicemente gli ultimi pubblicati senza filtri.
export function getLatestPublishedPosts(take: number, { excludeFeatured = false } = {}) {
  return prisma.post.findMany({
    where: {
      visibility: "PUBLIC",
      publishedAt: { not: null, lte: new Date() },
      ...(excludeFeatured ? { featured: false } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: { categories: true, _count: { select: { images: true } } },
  });
}

// Tutti gli articoli in evidenza (non solo il più recente): la home li mostra per intero nel
// blocco "Il Borgo utile" invece di sceglierne uno solo.
export function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { visibility: "PUBLIC", publishedAt: { not: null, lte: new Date() }, featured: true },
    orderBy: { publishedAt: "desc" },
    include: { categories: true, _count: { select: { images: true } } },
  });
}

export function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, visibility: "PUBLIC", publishedAt: { not: null, lte: new Date() } },
    include: { categories: true, images: { orderBy: { order: "asc" } } },
  });
}

export function getPostByIdForAdmin(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { categories: true, images: { orderBy: { order: "asc" } } },
  });
}

export function getAllPostsForAdmin() {
  return prisma.post.findMany({
    // Bozze (publishedAt null) in fondo, non in cima.
    orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
    include: { categories: true },
  });
}

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
