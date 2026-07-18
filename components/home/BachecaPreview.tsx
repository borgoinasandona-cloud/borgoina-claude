import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Category, Post } from "@prisma/client";

type PreviewPost = Post & { categories: Category[]; _count: { images: number } };

export function BachecaPreview({ posts }: { posts: PreviewPost[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24 wide:max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-brick wide:text-sm">Sempre aggiornati</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
            Ultime dalla Bacheca
          </h2>
        </div>
        <Link
          href="/news"
          className="text-base font-bold text-brick transition-colors hover:text-brick-dark wide:text-lg"
        >
          Vedi tutte →
        </Link>
      </div>
      {posts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-ink-soft">Nessun articolo pubblicato per ora.</p>
      )}
    </section>
  );
}
