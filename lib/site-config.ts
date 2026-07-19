export const siteConfig = {
  name: "Borgo INA San Donà",
  contactEmail: process.env.CONTACT_EMAIL_TO ?? "borgoinasandona@gmail.com",
  // Da confermare/valorizzare quando disponibile (vedi PLANNING.md "Domande aperte").
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
};

export const navLinks = [
  { href: "/il-borgo", label: "Il Borgo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/news", label: "Bacheca" },
  { href: "/community", label: "Community" },
  { href: "/contatti", label: "Contatti" },
];
