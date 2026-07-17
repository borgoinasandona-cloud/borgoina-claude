import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Post } from "@prisma/client";

export function BachecaHighlight({ post }: { post: (Post & { categories: Category[] }) | null }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Il Borgo utile</h2>
      {post ? (
        <Link
          href={`/news/${post.slug}`}
          className="mt-8 flex flex-col gap-6 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white hover:shadow-lg hover:border-neutral-300 transition duration-300 sm:flex-row group"
        >
          <div className="aspect-video w-full shrink-0 overflow-hidden bg-neutral-100 sm:w-[400px]">
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
                  className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800"
                >
                  {category.name}
                </span>
              ))}
            </div>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 group-hover:text-green-700 transition-colors duration-200">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-3 text-base text-neutral-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </Link>
      ) : (
        <p className="mt-8 text-neutral-500">Nessuna notizia pubblicata per ora.</p>
      )}
    </section>
  );
}
