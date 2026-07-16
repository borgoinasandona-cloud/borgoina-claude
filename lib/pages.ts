import { prisma } from "@/lib/prisma";

export type StaticPageSlug = "il-borgo" | "chi-siamo" | "contatti";

export const staticPageTitles: Record<StaticPageSlug, string> = {
  "il-borgo": "Il Borgo",
  "chi-siamo": "Chi siamo",
  contatti: "Contatti",
};

export function getPage(slug: StaticPageSlug) {
  return prisma.page.findUnique({ where: { slug } });
}

export function getAllPages() {
  return prisma.page.findMany({ orderBy: { slug: "asc" } });
}

export function upsertPage(slug: StaticPageSlug, data: { title: string; content: string }) {
  return prisma.page.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });
}
