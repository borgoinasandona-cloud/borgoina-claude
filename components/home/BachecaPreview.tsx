import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Category, Post } from "@prisma/client";

export function BachecaPreview({ posts }: { posts: (Post & { categories: Category[] })[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900">Ultime dalla Bacheca</h2>
        <Link href="/news" className="text-sm font-medium text-green-700 hover:underline">
          Vedi tutte →
        </Link>
      </div>
      {posts.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-neutral-500">Nessun articolo pubblicato per ora.</p>
      )}
    </section>
  );
}
