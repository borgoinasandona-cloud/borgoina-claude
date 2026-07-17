import { HtmlContent } from "@/components/HtmlContent";

export function StaticPageView({
  title,
  content,
}: {
  title: string;
  content: string | null | undefined;
}) {
  return (
    <div>
      <div className="bg-neutral-50 border-b border-neutral-200/60 py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 leading-relaxed text-lg">
        {content ? (
          <HtmlContent content={content} />
        ) : (
          <p className="text-neutral-500">
            Contenuto non ancora disponibile. Verrà pubblicato a breve dall&apos;amministrazione.
          </p>
        )}
      </div>
    </div>
  );
}
