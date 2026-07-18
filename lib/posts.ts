import { prisma } from "@/lib/prisma";

export function getPublishedPosts({ categorySlug }: { categorySlug?: string } = {}) {
  return prisma.post.findMany({
    where: {
      visibility: "PUBLIC",
      publishedAt: { not: null, lte: new Date() },
      ...(categorySlug ? { categories: { some: { slug: categorySlug } } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: { categories: true },
  });
}

export function getLatestPublishedPosts(take: number) {
  return prisma.post.findMany({
    where: { visibility: "PUBLIC", publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    include: { categories: true },
  });
}

export function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { visibility: "PUBLIC", publishedAt: { not: null, lte: new Date() }, featured: true },
    orderBy: { publishedAt: "desc" },
    include: { categories: true },
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
