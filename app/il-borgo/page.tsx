import type { Metadata } from "next";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";
import { HtmlContent } from "@/components/HtmlContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["il-borgo"],
};

interface Section {
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

function parseSections(html: string): Section[] {
  const parts = html.split(/<h[23][^>]*>/);
  const sections: Section[] = [];

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

function parseIntro(html: string) {
  const firstH3Index = html.search(/<h[23][^>]*>/i);
  const introHtml = firstH3Index === -1 ? html : html.substring(0, firstH3Index);

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

export default async function IlBorgoPage() {
  const page = await getPage("il-borgo");

  if (!page?.content) {
    return <StaticPageView title={staticPageTitles["il-borgo"]} content={page?.content} />;
  }

  const intro = parseIntro(page.content);
  const sections = parseSections(page.content);

  // Fallback to default layout if parsing fails or page structure is different
  if (sections.length < 4) {
    return <StaticPageView title={staticPageTitles["il-borgo"]} content={page.content} />;
  }

  const section0 = sections[0];
  const section1 = sections[1];
  const section2 = sections[2];
  const section3 = sections[3];
  const remainingSections = sections.slice(4);

  return (
    <div>
      {/* Page Hero Banner */}
      <div className="relative h-[360px] md:h-[460px] flex items-center justify-center overflow-hidden bg-neutral-900 text-white px-4">
        {intro.image && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intro.image}
              alt={staticPageTitles["il-borgo"]}
              className="h-full w-full object-cover opacity-40 scale-105 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-900/40 to-neutral-950/50" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            {staticPageTitles["il-borgo"]}
          </h1>
          {intro.text && (
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-200/90 leading-relaxed font-medium drop-shadow-sm px-4">
              {intro.text}
            </p>
          )}
        </div>
      </div>

      {/* Section 0: Introduction Title Banner */}
      <div className="text-center max-w-3xl mx-auto py-12 md:py-16 px-4 mt-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          {section0.title}
        </h2>
        <div className="mt-4 text-lg text-neutral-600 leading-relaxed">
          <HtmlContent content={section0.textHtml} />
        </div>
      </div>

      {/* Columns Section (Section 1 and 2) */}
      <div className="mx-auto max-w-5xl px-4 pb-16 md:pb-24">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Column 1 */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-neutral-900">{section1.title}</h3>
              <div className="text-neutral-600 leading-relaxed">
                <HtmlContent content={section1.textHtml} />
              </div>
            </div>
            {section1.images[0] && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md border border-neutral-200/60 mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section1.images[0].src}
                  alt={section1.images[0].alt || section1.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Column 2 */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-neutral-900">{section2.title}</h3>
              <div className="text-neutral-600 leading-relaxed">
                <HtmlContent content={section2.textHtml} />
              </div>
            </div>
            {section2.images[0] && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md border border-neutral-200/60 mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section2.images[0].src}
                  alt={section2.images[0].alt || section2.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alternating Section 3 */}
      <div className="bg-neutral-50 border-t border-neutral-200/40 py-16 md:py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1">
              {section3.images[0] && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md border border-neutral-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section3.images[0].src}
                    alt={section3.images[0].alt || section3.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {section3.title}
              </h2>
              <div className="mt-4 text-neutral-600 leading-relaxed">
                <HtmlContent content={section3.textHtml} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other extra sections if any */}
      {remainingSections.length > 0 && (
        <div className="py-16 md:py-20 px-4">
          <div className="mx-auto max-w-5xl space-y-16">
            {remainingSections.map((section, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="grid gap-12 md:grid-cols-2 items-center">
                  <div className={isEven ? "order-1" : "order-1 md:order-2"}>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                      {section.title}
                    </h2>
                    <div className="mt-4 text-neutral-600 leading-relaxed">
                      <HtmlContent content={section.textHtml} />
                    </div>
                  </div>
                  <div className={isEven ? "order-2" : "order-2 md:order-1"}>
                    {section.images[0] && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md border border-neutral-200/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={section.images[0].src}
                          alt={section.images[0].alt || section.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
