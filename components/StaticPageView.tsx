import { HtmlContent } from "@/components/HtmlContent";

export function StaticPageView({
  title,
  content,
}: {
  title: string;
  content: string | null | undefined;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">{title}</h1>
      {content ? (
        <HtmlContent content={content} />
      ) : (
        <p className="mt-6 text-neutral-500">
          Contenuto non ancora disponibile. Verrà pubblicato a breve dall&apos;amministrazione.
        </p>
      )}
    </div>
  );
}
