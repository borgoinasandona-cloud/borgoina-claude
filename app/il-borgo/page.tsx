import type { Metadata } from "next";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";
import { HtmlContent } from "@/components/HtmlContent";
import { parseIntro, parseSections } from "@/lib/html-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["il-borgo"],
};

export default async function IlBorgoPage() {
  const page = await getPage("il-borgo");

  if (!page?.content) {
    return <StaticPageView title={staticPageTitles["il-borgo"]} content={page?.content} />;
  }

  const intro = parseIntro(page.content);
  const sections = parseSections(page.content);

  // Fallback al layout semplice se il contenuto non ha la struttura attesa (4 sezioni).
  if (sections.length < 4) {
    return <StaticPageView title={staticPageTitles["il-borgo"]} content={page.content} />;
  }

  const [section0, section1, section2, section3, ...remainingSections] = sections;

  return (
    <div>
      <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-ink px-4 text-cream md:h-[460px]">
        {intro.image && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intro.image}
              alt={staticPageTitles["il-borgo"]}
              className="h-full w-full scale-105 object-cover opacity-40 blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/60" />
          </div>
        )}
        <div className="relative z-10 mx-auto max-w-4xl space-y-4 text-center wide:max-w-5xl">
          <p className="eyebrow text-brick-light wide:text-sm">Comitato civico di quartiere</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight leading-[0.95] drop-shadow-md md:text-6xl lg:text-7xl wide:text-8xl">
            {staticPageTitles["il-borgo"]}
          </h1>
          {intro.text && (
            <p className="mx-auto max-w-2xl px-4 text-lg leading-relaxed text-cream/85 md:text-xl wide:max-w-3xl wide:text-2xl">
              {intro.text}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl px-4 py-12 text-center md:py-16 wide:max-w-4xl">
        <p className="eyebrow text-brick wide:text-sm">Storia e presente</p>
        <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
          {section0.title}
        </h2>
        <div className="mt-4 text-lg leading-relaxed text-ink-soft wide:text-xl">
          <HtmlContent content={section0.textHtml} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 md:pb-24 wide:max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2">
          {[section1, section2].map((section) => (
            <div key={section.title} className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-display text-2xl font-bold text-ink wide:text-3xl">{section.title}</h3>
                <div className="text-ink-soft leading-relaxed">
                  <HtmlContent content={section.textHtml} />
                </div>
              </div>
              {section.images[0] && (
                <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded border border-ink/10 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.images[0].src}
                    alt={section.images[0].alt || section.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-cream-deep px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl wide:max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              {section3.images[0] && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-ink/10 shadow-sm">
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
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink leading-tight md:text-4xl wide:text-5xl">
                {section3.title}
              </h2>
              <div className="mt-4 text-ink-soft leading-relaxed">
                <HtmlContent content={section3.textHtml} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {remainingSections.length > 0 && (
        <div className="px-4 py-16 md:py-20">
          <div className="mx-auto max-w-5xl space-y-16 wide:max-w-6xl">
            {remainingSections.map((section, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={section.title} className="grid items-center gap-12 md:grid-cols-2">
                  <div className={isEven ? "order-1" : "order-1 md:order-2"}>
                    <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink leading-tight md:text-4xl wide:text-5xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 text-ink-soft leading-relaxed">
                      <HtmlContent content={section.textHtml} />
                    </div>
                  </div>
                  <div className={isEven ? "order-2" : "order-2 md:order-1"}>
                    {section.images[0] && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-ink/10 shadow-sm">
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
