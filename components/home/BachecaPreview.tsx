import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Category, Post } from "@prisma/client";

export function BachecaPreview({ posts }: { posts: (Post & { categories: Category[] })[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-brick">Sempre aggiornati</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Ultime dalla Bacheca
          </h2>
        </div>
        <Link href="/news" className="text-base font-bold text-brick transition-colors hover:text-brick-dark">
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
