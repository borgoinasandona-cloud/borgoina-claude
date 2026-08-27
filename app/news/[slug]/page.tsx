import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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
  if (!post) return { title: "Articolo" };

  const description = post.excerpt ?? undefined;
  const images = post.coverImage
    ? [{ url: cloudinaryUrl(post.coverImage, { width: 1200, height: 630, crop: "fill" }) }]
    : undefined;

  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, images },
    twitter: { card: "summary_large_image", title: post.title, description, images: images?.map((i) => i.url) },
  };
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
      <header className="px-4 pt-16 pb-2">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-brick transition-colors hover:text-brick-dark"
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" className="!h-3 !w-3" />
            Torna alla Bacheca
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

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-12 text-lg leading-relaxed text-ink wide:max-w-4xl wide:text-xl">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 1200, crop: "limit" })}
            alt={post.title}
            className="mb-8 w-full rounded border border-ink/5 object-cover shadow-sm"
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
              <FontAwesomeIcon icon={faImage} className="!h-4 !w-4" aria-hidden="true" />
              Vedi la galleria completa
            </a>
          </p>
        )}

        {post.images.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow inline-flex items-center gap-1.5 text-brick">
              <FontAwesomeIcon icon={faImage} className="!h-3.5 !w-3.5" aria-hidden="true" />
              Galleria
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt ?? post.title}
                  className="aspect-square w-full rounded border border-ink/5 object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
