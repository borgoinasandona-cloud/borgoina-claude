export interface HtmlSection {
  title: string;
  textHtml: string;
  images: { src: string; alt: string }[];
}

function parseImagesFromHtml(html: string) {
  const imgTagRegex = /<img\s+[^>]*>/gi;
  const images: { src: string; alt: string; rawTag: string }[] = [];
  let match;
  while ((match = imgTagRegex.exec(html)) !== null) {
    const rawTag = match[0];
    const srcMatch = /src="([^"]+)"/i.exec(rawTag) || /src='([^']+)'/i.exec(rawTag);
    const altMatch = /alt="([^"]*)"/i.exec(rawTag) || /alt='([^']*)'/i.exec(rawTag);
    if (srcMatch) {
      images.push({
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : "",
        rawTag,
      });
    }
  }
  return images;
}

/** Divide il contenuto HTML della pagina in sezioni, una per ogni <h2>/<h3>. */
export function parseSections(html: string): HtmlSection[] {
  const parts = html.split(/<h[23][^>]*>/);
  const sections: HtmlSection[] = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const subParts = part.split(/<\/h[23]>/);
    if (subParts.length < 2) continue;

    const title = subParts[0].trim();
    const bodyHtml = subParts.slice(1).join("</h[23]>").trim();

    const parsedImages = parseImagesFromHtml(bodyHtml);
    let textHtml = bodyHtml;
    for (const img of parsedImages) {
      textHtml = textHtml.replace(img.rawTag, "");
    }

    sections.push({
      title,
      textHtml: textHtml.trim(),
      images: parsedImages,
    });
  }

  return sections;
}

/** Estrae testo e prima immagine dal contenuto prima del primo <h2>/<h3> (per l'hero). */
export function parseIntro(html: string) {
  const firstHeadingIndex = html.search(/<h[23][^>]*>/i);
  const introHtml = firstHeadingIndex === -1 ? html : html.substring(0, firstHeadingIndex);

  const images = parseImagesFromHtml(introHtml);

  let text = introHtml;
  for (const img of images) {
    text = text.replace(img.rawTag, "");
  }

  const cleanText = text.replace(/<[^>]*>/g, "").trim();

  return {
    text: cleanText,
    image: images[0] ? images[0].src : null,
  };
}
