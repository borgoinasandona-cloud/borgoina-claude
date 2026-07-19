export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // rimuove i segni diacritici combinanti prodotti da normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

/** Slug leggibile + suffisso corto per evitare collisioni tra titoli simili/uguali. */
export function slugifyWithSuffix(input: string) {
  const base = slugify(input) || "annuncio";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
