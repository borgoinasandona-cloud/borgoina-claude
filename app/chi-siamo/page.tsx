import type { Metadata } from "next";
import Link from "next/link";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";
import { HtmlContent } from "@/components/HtmlContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["chi-siamo"],
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

export default async function ChiSiamoPage() {
  const page = await getPage("chi-siamo");
  
  if (!page?.content) {
    return <StaticPageView title={staticPageTitles["chi-siamo"]} content={page?.content} />;
  }

  const sections = parseSections(page.content);

  // Fallback to simple rendering if parsing didn't find any structured sections
  if (sections.length === 0) {
    return <StaticPageView title={staticPageTitles["chi-siamo"]} content={page.content} />;
  }

  return (
    <div>
      {/* Page Header Hero */}
      <div className="bg-neutral-50 border-b border-neutral-200/60 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {staticPageTitles["chi-siamo"]}
          </h1>
        </div>
      </div>

      {/* Sections Layout */}
      <div>
        {sections.map((section, index) => {
          const { title, textHtml, images } = section;
          
          let sectionBg = "bg-white";
          let gridClass = "grid gap-12 lg:grid-cols-12 items-center";
          let textColClass = "lg:col-span-6";
          let imageColClass = "lg:col-span-6";
          let isFullWidth = false;

          // Align precisely with reference page design
          if (index === 0) {
            sectionBg = "bg-neutral-50 border-b border-neutral-200/40";
            textColClass = "lg:col-span-5";
            imageColClass = "lg:col-span-7";
          } else if (index === 1) {
            sectionBg = "bg-white";
            gridClass = "grid gap-12 md:grid-cols-2 items-center";
            textColClass = "order-1 md:order-2";
            imageColClass = "order-2 md:order-1";
          } else if (index === 2) {
            sectionBg = "bg-white";
            gridClass = "grid gap-12 md:grid-cols-2 items-center";
            textColClass = "order-1";
            imageColClass = "order-2";
          } else if (index === 3) {
            sectionBg = "bg-neutral-50 border-y border-neutral-200/40";
            isFullWidth = true;
          } else {
            // Generative alternation for extra sections
            const isEven = index % 2 === 0;
            sectionBg = isEven ? "bg-neutral-50 border-y border-neutral-200/40" : "bg-white";
            gridClass = "grid gap-12 md:grid-cols-2 items-center";
            if (isEven) {
              textColClass = "order-1 md:order-2";
              imageColClass = "order-2 md:order-1";
            }
          }

          return (
            <div key={index} className={`${sectionBg} py-16 md:py-20 px-4`}>
              <div className="mx-auto max-w-5xl">
                {isFullWidth ? (
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                      {title}
                    </h2>
                    <div className="mt-4 text-neutral-600 leading-relaxed">
                      <HtmlContent content={textHtml} />
                    </div>
                    {images[0] && (
                      <div className="mt-8 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={images[0].src}
                          alt={images[0].alt || title}
                          className="max-w-full h-auto rounded-2xl shadow-md border border-neutral-200/60"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={gridClass}>
                    <div className={textColClass}>
                      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                        {title}
                      </h2>
                      <div className="mt-4 text-neutral-600 leading-relaxed">
                        <HtmlContent content={textHtml} />
                      </div>
                      {index === 0 && (
                        <div className="mt-6">
                          <Link
                            href="/news"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-800 transition duration-200"
                          >
                            Vedi la gallery
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className={imageColClass}>
                      {images[0] && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md border border-neutral-200/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={images[0].src}
                            alt={images[0].alt || title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
