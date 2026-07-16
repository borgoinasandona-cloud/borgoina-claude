import { notFound } from "next/navigation";
import { getPage, staticPageTitles, type StaticPageSlug } from "@/lib/pages";
import { PageForm } from "@/components/PageForm";

export const dynamic = "force-dynamic";

const validSlugs = Object.keys(staticPageTitles) as StaticPageSlug[];

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!validSlugs.includes(slug as StaticPageSlug)) {
    notFound();
  }

  const typedSlug = slug as StaticPageSlug;
  const page = await getPage(typedSlug);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        Modifica pagina: {staticPageTitles[typedSlug]}
      </h1>
      <PageForm
        slug={typedSlug}
        title={page?.title ?? staticPageTitles[typedSlug]}
        content={page?.content ?? ""}
      />
    </div>
  );
}
