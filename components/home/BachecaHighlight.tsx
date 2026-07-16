import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Post } from "@prisma/client";

export function BachecaHighlight({ post }: { post: (Post & { categories: Category[] }) | null }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-2xl font-semibold text-neutral-900">Il Borgo utile</h2>
      {post ? (
        <Link
          href={`/news/${post.slug}`}
          className="mt-6 flex flex-col gap-6 overflow-hidden rounded-lg border border-neutral-200 hover:shadow-md sm:flex-row"
        >
          <div className="aspect-video w-full shrink-0 bg-neutral-100 sm:w-80">
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryUrl(post.coverImage, { width: 640, crop: "fill" })}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="p-4 sm:py-6 sm:pr-6">
            <div className="flex flex-wrap gap-1.5">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800"
                >
                  {category.name}
                </span>
              ))}
            </div>
            <h3 className="mt-2 text-xl font-semibold text-neutral-900">{post.title}</h3>
            {post.excerpt && <p className="mt-2 text-sm text-neutral-600">{post.excerpt}</p>}
          </div>
        </Link>
      ) : (
        <p className="mt-6 text-neutral-500">Nessuna notizia pubblicata per ora.</p>
      )}
    </section>
  );
}
