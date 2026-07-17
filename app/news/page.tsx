import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getAllCategories } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bacheca",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [posts, categories] = await Promise.all([
    getPublishedPosts({ categorySlug: categoria }),
    getAllCategories(),
  ]);

  return (
    <div>
      <div className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow text-brick">Notizie dal quartiere</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl">
            Bacheca
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="font-mono flex flex-wrap gap-2 text-xs font-semibold tracking-wide uppercase">
          <Link
            href="/news"
            className={`rounded-sm border px-3 py-1.5 transition-colors ${
              !categoria
                ? "border-brick bg-brick text-cream"
                : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
            }`}
          >
            Tutte
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/news?categoria=${category.slug}`}
              className={`rounded-sm border px-3 py-1.5 transition-colors ${
                categoria === category.slug
                  ? "border-brick bg-brick text-cream"
                  : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">Nessun articolo pubblicato per ora.</p>
        )}
      </div>
    </div>
  );
}
