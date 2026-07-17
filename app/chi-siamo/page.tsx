import type { Metadata } from "next";
import Link from "next/link";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";
import { HtmlContent } from "@/components/HtmlContent";
import { parseSections } from "@/lib/html-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["chi-siamo"],
};

const EYEBROWS = ["Il quartiere", "L'associazione", "Le persone", "La struttura"];

export default async function ChiSiamoPage() {
  const page = await getPage("chi-siamo");

  if (!page?.content) {
    return <StaticPageView title={staticPageTitles["chi-siamo"]} content={page?.content} />;
  }

  const sections = parseSections(page.content);

  if (sections.length === 0) {
    return <StaticPageView title={staticPageTitles["chi-siamo"]} content={page.content} />;
  }

  return (
    <div>
      <div className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl wide:max-w-6xl">
          <p className="eyebrow text-brick wide:text-sm">Comitato civico di quartiere</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {staticPageTitles["chi-siamo"]}
          </h1>
        </div>
      </div>

      {sections.map((section, index) => {
        const { title, textHtml, images } = section;
        const isFullWidth = index === 3;
        const isEven = index % 2 === 0;
        const sectionBg = isFullWidth || isEven ? "bg-cream-deep" : "bg-cream";
        const gridClass = "grid gap-12 md:grid-cols-2 items-center";
        const textColClass = isEven || index === 0 ? "order-1" : "order-1 md:order-2";
        const imageColClass = isEven || index === 0 ? "order-2" : "order-2 md:order-1";

        return (
          <div key={title} className={`${sectionBg} border-b border-ink/5 px-4 py-16 md:py-20`}>
            <div className="mx-auto max-w-5xl wide:max-w-6xl">
              {isFullWidth ? (
                <div className="mx-auto max-w-3xl text-center wide:max-w-4xl">
                  <p className="eyebrow text-sky-dark wide:text-sm">{EYEBROWS[index] ?? "Il comitato"}</p>
                  <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink leading-tight md:text-4xl wide:text-5xl">
                    {title}
                  </h2>
                  <div className="mt-4 text-ink-soft leading-relaxed wide:text-lg">
                    <HtmlContent content={textHtml} />
                  </div>
                  {images[0] && (
                    <div className="mt-8 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[0].src}
                        alt={images[0].alt || title}
                        className="h-auto max-w-full rounded border border-ink/10 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className={gridClass}>
                  <div className={textColClass}>
                    <p className="eyebrow text-brick wide:text-sm">{EYEBROWS[index] ?? "Il comitato"}</p>
                    <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink leading-tight md:text-4xl wide:text-5xl">
                      {title}
                    </h2>
                    <div className="mt-4 text-ink-soft leading-relaxed wide:text-lg">
                      <HtmlContent content={textHtml} />
                    </div>
                    {index === 0 && (
                      <div className="mt-6">
                        <Link
                          href="/news"
                          className="inline-flex items-center gap-1.5 rounded bg-brick px-5 py-2.5 text-sm font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark"
                        >
                          Vedi la gallery
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className={imageColClass}>
                    {images[0] && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-ink/10 shadow-sm">
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
  );
}
