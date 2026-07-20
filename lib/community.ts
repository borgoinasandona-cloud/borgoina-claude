import { prisma } from "@/lib/prisma";
import type { CommunityPost, Comment, CommunityPostType } from "@prisma/client";

// Segnalazioni/eventi (ISSUE, ANNOUNCEMENT) ritirate dalla community il 2026-07-20: quel
// contenuto vive nella bacheca news (Post), non più selezionabile/creabile qui. I due valori
// restano nell'enum Postgres (niente DROP VALUE pulito) ma non compaiono in nessuna label.
export const communityPostTypeLabels: Record<string, string> = {
  GIFT: "Regalo",
  SALE: "Vendo",
  LOAN: "Presto",
  SERVICE_OFFER: "Offro",
  REQUEST: "Chiedo",
};

export const communityPostTypeGroups = [
  { label: "Oggetti", types: ["GIFT", "SALE", "LOAN"] },
  { label: "Servizi e lavori", types: ["SERVICE_OFFER", "REQUEST"] },
];

export const communityPostStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponibile",
  PENDING: "In sospeso",
  CLOSED: "Chiuso",
};

/**
 * Ogni tipo di annuncio ancora selezionabile è uno scambio "privato" (oggetto o servizio) tra
 * due persone: tutti hanno lo stato disponibile/in sospeso/chiuso e commenti autore↔commentatore.
 * Non c'è più una categoria "pubblica" tipo segnalazioni/eventi rimasta in community.
 */
export function isObjectPostType(type: string) {
  return type in communityPostTypeLabels;
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
