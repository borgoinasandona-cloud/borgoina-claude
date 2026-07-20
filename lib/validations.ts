import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  email: z.string().trim().email("Email non valida"),
  message: z.string().trim().min(1, "Il messaggio è obbligatorio").max(5000),
});

export const pageSchema = z.object({
  slug: z.enum(["il-borgo", "chi-siamo", "contatti"]),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido (usa minuscole e trattini)"),
});

export const postImageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().max(200).optional(),
  order: z.number().int().min(0).default(0),
});

export const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido (usa minuscole e trattini)"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(1),
  coverImage: z.string().trim().optional().or(z.literal("")),
  externalLink: z.string().trim().url("URL non valida").optional().or(z.literal("")),
  publishedAt: z.string().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  categoryIds: z.array(z.string()).default([]),
  images: z.array(postImageSchema).default([]),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  email: z.string().trim().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(200),
});

// ISSUE/ANNOUNCEMENT ritirati dalla community il 2026-07-20 (vedi lib/community.ts) — non più
// creabili da qui, anche se restano nell'enum Postgres per compatibilità.
const COMMUNITY_POST_TYPES = ["GIFT", "SALE", "LOAN", "SERVICE_OFFER", "REQUEST"] as const;

export const communityPostSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  content: z.string().trim().min(1, "Il testo è obbligatorio").max(5000),
  coverImage: z.string().trim().optional().or(z.literal("")),
  type: z.enum(COMMUNITY_POST_TYPES),
});

export const communityPostStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "PENDING", "CLOSED"]),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Il commento è obbligatorio").max(2000),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  email: z.string().trim().email("Email non valida"),
  currentPassword: z.string().min(1, "Inserisci la password attuale per confermare le modifiche"),
  newPassword: z
    .string()
    .min(8, "La nuova password deve avere almeno 8 caratteri")
    .max(200)
    .optional()
    .or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PostInput = z.infer<typeof postSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
