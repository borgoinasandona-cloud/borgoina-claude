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
      <div className="bg-neutral-50 border-b border-neutral-200/60 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {staticPageTitles.contatti}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3 text-neutral-800 text-lg leading-relaxed">
            {page?.content ? (
              <HtmlContent content={page.content} />
            ) : (
              <p className="text-neutral-600">
                Puoi scriverci a{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-green-700 underline">
                  {siteConfig.contactEmail}
                </a>{" "}
                oppure usare il modulo a fianco.
              </p>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Inviaci un messaggio</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
