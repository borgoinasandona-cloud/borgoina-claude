export const siteConfig = {
  name: "Borgo INA San Donà",
  contactEmail: process.env.CONTACT_EMAIL_TO ?? "borgoinasandona@gmail.com",
  // Da confermare/valorizzare quando disponibile (vedi PLANNING.md "Domande aperte").
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
};

export const navLinks = [
  // Pagine del sito
  { href: "/il-borgo", label: "Il Borgo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
  // Servizi (Instagram resta a parte, non in questo elenco — vedi Header/Footer)
  { href: "/news", label: "Bacheca" },
  { href: "/community", label: "Community" },
];
