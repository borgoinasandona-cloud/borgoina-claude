import { prisma } from "@/lib/prisma";
import type { CommunityPost, Comment, CommunityPostType } from "@prisma/client";

export const communityPostTypeLabels: Record<string, string> = {
  REQUEST: "Cerco",
  GIFT: "Regalo",
  LOAN: "Offro",
  SALE: "Vendo",
  ISSUE: "Segnalazione",
  ANNOUNCEMENT: "Evento/Avviso",
};

export const communityPostStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponibile",
  PENDING: "In sospeso",
  CLOSED: "Chiuso",
};

export const OBJECT_TYPES = ["REQUEST", "GIFT", "LOAN", "SALE"];

export function isObjectPostType(type: string) {
  return OBJECT_TYPES.includes(type);
}

/** Visibilità di default dei commenti in base al tipo, applicata alla creazione del post. */
export function defaultCommentVisibilityFor(type: string) {
  return isObjectPostType(type) ? "AUTHOR_ONLY" : "PUBLIC";
}

const communityPostInclude = {
  author: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} as const;

export function getPublishedCommunityPosts({ type }: { type?: CommunityPostType } = {}) {
  return prisma.communityPost.findMany({
    where: {
      visibility: "PUBLIC",
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: communityPostInclude,
  });
}

export function getCommunityPostBySlug(slug: string) {
  return prisma.communityPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

export function getAllCommunityPostsForAdmin() {
  return prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    include: communityPostInclude,
  });
}

type CommentWithAuthor = Comment & { author: { id: string; name: string | null; email: string } };

/**
 * Regola: sui post di tipo oggetto con visibilityOfComments = AUTHOR_ONLY, un commento è
 * visibile solo all'autore del post (vede tutto) e a chi lo ha scritto (vede solo il proprio).
 * Non essendoci un concetto di "thread" nello schema, un utente che ha già commentato vede
 * anche le risposte dell'autore (autore -> tutti quelli con cui ha "conversato" almeno una volta),
 * ma non i commenti scritti da altri utenti.
 */
export function filterVisibleComments(
  post: Pick<CommunityPost, "authorId" | "visibilityOfComments">,
  comments: CommentWithAuthor[],
  viewerId: string | null,
) {
  if (post.visibilityOfComments === "PUBLIC") return comments;

  if (!viewerId) return [];
  if (viewerId === post.authorId) return comments;

  return comments.filter((c) => c.authorId === viewerId || c.authorId === post.authorId);
}
