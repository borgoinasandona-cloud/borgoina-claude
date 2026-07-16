import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Category, Post } from "@prisma/client";

export function PostCard({ post }: { post: Post & { categories: Category[] } }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="block overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-md"
    >
      <div className="aspect-video w-full bg-neutral-100">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 640, crop: "fill" })}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
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
        <h2 className="mt-2 text-lg font-semibold text-neutral-900">{post.title}</h2>
        {post.publishedAt && (
          <p className="mt-1 text-xs text-neutral-500">
            {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
          </p>
        )}
        {post.excerpt && <p className="mt-2 text-sm text-neutral-600">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
