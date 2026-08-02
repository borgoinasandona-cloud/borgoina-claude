export const siteConfig = {
  name: "Borgo INA San Donà",
  contactEmail: process.env.CONTACT_EMAIL_TO ?? "borgoinasandona@gmail.com",
  // Da confermare/valorizzare quando disponibile (vedi PLANNING.md "Domande aperte").
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  // Base per i link assoluti nelle email (verifica account, reset password): niente auto-detect
  // affidabile lato server action, va impostato esplicitamente per env (vedi .env.example).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const navLinks: { href: string; label: string; accent?: "sky" | "sage" | "brick" }[] = [
  // Pagine del sito
  { href: "/il-borgo", label: "Il Borgo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/news", label: "Bacheca" },
  { href: "/contatti", label: "Contatti" },
  // Servizi: fondino colorato per distinguerli dalle pagine (vedi navLinkAccentClasses in
  // Header/Footer). Instagram resta a parte, non in questo elenco. "Mercatino" è la stessa
  // funzionalità di prima (route /community invariata, solo l'etichetta nel menù è cambiata).
  { href: "/community", label: "Mercatino", accent: "sage" },
  { href: "/botteghe", label: "Botteghe", accent: "brick" },
  { href: "/soci", label: "Soci", accent: "sky" },
];

/** Classi Tailwind per il fondino colorato dei link "servizio" (Mercatino/Botteghe/Soci) nel menù. */
export const navLinkAccentClasses: Record<"sky" | "sage" | "brick", string> = {
  sky: "bg-sky text-white hover:bg-sky-dark",
  sage: "bg-sage text-white hover:bg-sage-dark",
  brick: "bg-brick text-white hover:bg-brick-dark",
};
