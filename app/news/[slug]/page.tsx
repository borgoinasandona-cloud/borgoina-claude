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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/news" className="text-sm text-green-700 hover:underline">
        ← Torna alla Bacheca
      </Link>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.categories.map((category) => (
          <span
            key={category.id}
            className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800"
          >
            {category.name}
          </span>
        ))}
      </div>

      <h1 className="mt-2 text-3xl font-semibold text-neutral-900">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-1 text-sm text-neutral-500">
          {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
        </p>
      )}

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cloudinaryUrl(post.coverImage, { width: 1200, crop: "limit" })}
          alt={post.title}
          className="mt-6 w-full rounded-lg object-cover"
        />
      )}

      <HtmlContent content={post.content} />

      {post.externalLink && (
        <p className="mt-6">
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            Vedi la galleria completa
          </a>
        </p>
      )}

      {post.images.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {post.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.url}
              alt={image.alt ?? post.title}
              className="aspect-square w-full rounded-md object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
