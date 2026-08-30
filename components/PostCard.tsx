import Link from "next/link";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { hasGallery } from "@/lib/posts";
import { GalleryBadge } from "@/components/GalleryBadge";
import type { Category, Post } from "@prisma/client";

export function PostCard({
  post,
  mobileHorizontal = false,
}: {
  post: Post & { categories: Category[]; _count: { images: number } };
  // Solo sotto sm: immagine a sinistra (colonna stretta) e contenuto a destra, invece dello stack
  // verticale normale — usato solo da BachecaPreview.tsx in home, non dalla lista /news, che
  // resta con lo stack verticale a tutti i breakpoint.
  mobileHorizontal?: boolean;
}) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className={`group overflow-hidden rounded-xl border border-ink/10 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl ${
        mobileHorizontal ? "flex flex-row sm:block" : "block"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-cream-deep ${
          mobileHorizontal ? "aspect-square w-28 sm:aspect-video sm:w-full" : "aspect-video w-full"
        }`}
      >
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
      <div className={`min-w-0 ${mobileHorizontal ? "p-3 sm:p-5" : "p-5"}`}>
        {mobileHorizontal ? (
          // Per risparmiare spazio nella colonna stretta: categorie e data sulla stessa riga
          // (categorie a sinistra, data a destra in cifre dd/mm/aa invece del formato lungo).
          <div className="flex items-center justify-between gap-2">
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
            {post.publishedAt && (
              <p className="font-mono shrink-0 text-[0.7rem] text-ink-soft">
                {new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(
                  post.publishedAt,
                )}
              </p>
            )}
          </div>
        ) : (
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
        )}
        <h2 className="font-display mt-3 text-xl font-bold text-ink transition-colors duration-200 group-hover:text-brick line-clamp-2 wide:text-2xl">
          {post.title}
        </h2>
        {!mobileHorizontal && post.publishedAt && (
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
