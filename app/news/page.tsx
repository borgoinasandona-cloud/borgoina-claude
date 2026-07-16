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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Bacheca</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={`rounded-full px-3 py-1 text-sm ${
            !categoria ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Tutte
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/news?categoria=${category.slug}`}
            className={`rounded-full px-3 py-1 text-sm ${
              categoria === category.slug
                ? "bg-green-700 text-white"
                : "bg-neutral-100 text-neutral-700"
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
        <p className="mt-8 text-neutral-500">Nessun articolo pubblicato per ora.</p>
      )}
    </div>
  );
}
