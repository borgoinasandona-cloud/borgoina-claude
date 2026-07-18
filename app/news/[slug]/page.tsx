import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedPostBySlug } from "@/lib/posts";
import { HtmlContent } from "@/components/HtmlContent";
import { cloudinaryUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  return { title: post?.title ?? "Articolo" };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <header className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-brick transition-colors hover:text-brick-dark"
          >
            ← Torna alla Bacheca
          </Link>

          <div className="flex flex-wrap gap-1.5">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="font-mono rounded-sm bg-brick/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-brick uppercase"
              >
                {category.name}
              </span>
            ))}
          </div>

          <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="font-mono mt-3 text-sm text-ink-soft">
              {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 text-lg leading-relaxed text-ink wide:max-w-4xl wide:text-xl">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 1200, crop: "limit" })}
            alt={post.title}
            className="mb-8 w-full rounded border border-ink/10 object-cover shadow-sm"
          />
        )}

        <HtmlContent content={post.content} />

        {post.externalLink && (
          <p className="mt-6">
            <a
              href={post.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-brick px-4 py-2 text-base font-semibold text-cream no-underline shadow-md transition-colors hover:bg-brick-dark"
            >
              🖼️ Vedi la galleria completa
            </a>
          </p>
        )}

        {post.images.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow text-brick">🖼️ Galleria</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt ?? post.title}
                  className="aspect-square w-full rounded border border-ink/10 object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
