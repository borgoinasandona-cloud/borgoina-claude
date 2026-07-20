export const siteConfig = {
  name: "Borgo INA San Donà",
  contactEmail: process.env.CONTACT_EMAIL_TO ?? "borgoinasandona@gmail.com",
  // Da confermare/valorizzare quando disponibile (vedi PLANNING.md "Domande aperte").
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
};

export const navLinks: { href: string; label: string; accent?: "sky" | "sage" }[] = [
  // Pagine del sito
  { href: "/il-borgo", label: "Il Borgo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
  // Servizi: fondino colorato per distinguerli dalle pagine (vedi navLinkAccentClasses in
  // Header/Footer). Instagram resta a parte, non in questo elenco.
  { href: "/news", label: "Bacheca", accent: "sky" },
  { href: "/community", label: "Community", accent: "sage" },
];

/** Classi Tailwind per il fondino colorato dei link "servizio" (Bacheca/Community) nel menù. */
export const navLinkAccentClasses: Record<"sky" | "sage", string> = {
  sky: "bg-sky text-white hover:bg-sky-dark",
  sage: "bg-sage text-white hover:bg-sage-dark",
};
