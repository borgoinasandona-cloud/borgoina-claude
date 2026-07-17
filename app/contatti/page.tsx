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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">{staticPageTitles.contatti}</h1>

      {page?.content ? (
        <HtmlContent content={page.content} />
      ) : (
        <p className="mt-6 text-neutral-600">
          Puoi scriverci a{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-green-700 underline">
            {siteConfig.contactEmail}
          </a>{" "}
          oppure usare il modulo qui sotto.
        </p>
      )}

      <ContactForm />
    </div>
  );
}
