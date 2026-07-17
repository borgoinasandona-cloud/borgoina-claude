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
      <div className="border-b border-ink/10 bg-cream-deep py-16 px-4">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 text-lg leading-relaxed text-ink wide:max-w-4xl wide:text-xl">
        {content ? (
          <HtmlContent content={content} />
        ) : (
          <p className="text-ink-soft">
            Contenuto non ancora disponibile. Verrà pubblicato a breve dall&apos;amministrazione.
          </p>
        )}
      </div>
    </div>
  );
}
