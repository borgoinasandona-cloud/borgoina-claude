import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { hasGallery } from "@/lib/posts";
import { GalleryBadge } from "@/components/GalleryBadge";
import type { Category, Post } from "@prisma/client";

export function PostCard({
  post,
}: {
  post: Post & { categories: Category[]; _count: { images: number } };
}) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group block overflow-hidden rounded border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-cream-deep">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 640, crop: "fill" })}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {hasGallery(post) && (
          <div className="absolute right-2 bottom-2">
            <GalleryBadge />
          </div>
        )}
      </div>
      <div className="p-5">
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
        <h2 className="font-display mt-3 text-xl font-bold text-ink transition-colors duration-200 group-hover:text-brick line-clamp-2 wide:text-2xl">
          {post.title}
        </h2>
        {post.publishedAt && (
          <p className="font-mono mt-2 text-xs text-ink-soft wide:text-sm">
            {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
          </p>
        )}
        {post.excerpt && (
          <p className="mt-3 text-base leading-relaxed text-ink-soft line-clamp-3 wide:text-lg">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
