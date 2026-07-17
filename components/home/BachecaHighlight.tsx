import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Post } from "@prisma/client";

export function BachecaHighlight({ post }: { post: (Post & { categories: Category[] }) | null }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24 wide:max-w-6xl">
      <p className="eyebrow text-brick wide:text-sm">In evidenza</p>
      <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
        Il Borgo utile
      </h2>
      {post ? (
        <Link
          href={`/news/${post.slug}`}
          className="group mt-8 flex flex-col overflow-hidden rounded border border-ink/10 bg-white transition duration-300 hover:border-ink/20 hover:shadow-lg sm:flex-row"
        >
          <div className="aspect-video w-full shrink-0 overflow-hidden bg-cream-deep sm:w-[400px]">
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryUrl(post.coverImage, { width: 800, crop: "fill" })}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6 sm:py-8 sm:pr-8">
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
            <h3 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-ink transition-colors duration-200 group-hover:text-brick wide:text-3xl">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-3 text-base leading-relaxed text-ink-soft wide:text-lg">{post.excerpt}</p>
            )}
          </div>
        </Link>
      ) : (
        <p className="mt-8 text-ink-soft">Nessuna notizia pubblicata per ora.</p>
      )}
    </section>
  );
}
