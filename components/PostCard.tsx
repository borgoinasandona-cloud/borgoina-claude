import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Post } from "@prisma/client";

export function PostCard({ post }: { post: Post & { categories: Category[] } }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300 transition duration-300 group"
    >
      <div className="aspect-video w-full overflow-hidden bg-neutral-100">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 640, crop: "fill" })}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-5">
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
        <h2 className="mt-3 text-xl font-bold text-neutral-900 group-hover:text-green-700 transition-colors duration-200 line-clamp-2">
          {post.title}
        </h2>
        {post.publishedAt && (
          <p className="mt-2 text-sm text-neutral-500">
            {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
          </p>
        )}
        {post.excerpt && (
          <p className="mt-3 text-base text-neutral-600 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
