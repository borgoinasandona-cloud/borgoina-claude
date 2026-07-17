import type { Metadata } from "next";
import { getPage, staticPageTitles } from "@/lib/pages";
import { HtmlContent } from "@/components/HtmlContent";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles.contatti,
};

export default async function ContattiPage() {
  const page = await getPage("contatti");

  return (
    <div>
      <div className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow text-brick">Scrivici</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl">
            {staticPageTitles.contatti}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="text-lg leading-relaxed text-ink lg:col-span-3">
            {page?.content ? (
              <HtmlContent content={page.content} />
            ) : (
              <p className="text-ink-soft">
                Puoi scriverci a{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-brick underline">
                  {siteConfig.contactEmail}
                </a>{" "}
                oppure usare il modulo a fianco.
              </p>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
              <p className="eyebrow text-brick">Modulo di contatto</p>
              <h2 className="font-display mt-2 text-xl font-bold text-ink">Inviaci un messaggio</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
