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

const SHOP_CATEGORIES = ["CRAFTS", "SHOP", "FOOD", "SERVICES", "OTHER"] as const;

export const shopImageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().max(200).optional(),
  order: z.number().int().min(0).default(0),
});

export const shopSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  category: z.enum(SHOP_CATEGORIES),
  // Chi siamo
  slogan: z.string().trim().max(150).optional().or(z.literal("")),
  description: z.string().trim().min(1, "La descrizione è obbligatoria").max(3000),
  history: z.string().trim().max(1500).optional().or(z.literal("")),
  whyChooseUs: z.string().trim().max(1500).optional().or(z.literal("")),
  // Contatti
  address: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Email non valida").optional().or(z.literal("")),
  website: z.string().trim().url("URL non valida").optional().or(z.literal("")),
  instagram: z.string().trim().url("URL non valida").optional().or(z.literal("")),
  hours: z.string().trim().max(500).optional().or(z.literal("")),
  coverImage: z.string().trim().optional().or(z.literal("")),
  // Nome del gestore da mostrare finché non c'è un account collegato — solo l'admin lo valorizza,
  // vedi ShopForm.tsx (campo mostrato solo in adminMode) e adminCreateShopAction/adminUpdateShopAction.
  ownerName: z.string().trim().max(120).optional().or(z.literal("")),
  images: z.array(shopImageSchema).default([]),
});

export const eventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido (usa minuscole e trattini)"),
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  date: z.string().trim().min(1, "La data è obbligatoria"),
  maxSeats: z.coerce.number().int().min(1).optional().or(z.literal("")),
  notesLabel: z.string().trim().max(120).optional().or(z.literal("")),
});

// guests limitato a 20: nessun vincolo esplicito richiesto, ma un tetto ragionevole evita che un
// singolo RSVP possa svuotare maxSeats per un errore di battitura (es. "200" invece di "2").
export const eventRsvpSchema = z.object({
  guests: z.coerce.number().int().min(0).max(20),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email non valida"),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(200),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  email: z.string().trim().email("Email non valida"),
  // Cloudinary secure_url, come CommunityPost.coverImage — stringa vuota = nessuna foto.
  image: z.string().trim().optional().or(z.literal("")),
  // Obbligatoria solo per chi ha già una password impostata (login Credentials) — chi si è
  // registrato solo con Google non ne ha una da confermare, controllato lato action.
  currentPassword: z.string().optional().or(z.literal("")),
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
export type ShopInput = z.infer<typeof shopSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type EventRsvpInput = z.infer<typeof eventRsvpSchema>;
