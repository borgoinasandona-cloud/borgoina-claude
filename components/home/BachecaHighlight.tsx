import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { hasGallery } from "@/lib/posts";
import { GalleryBadge } from "@/components/GalleryBadge";
import type { Category, Post } from "@prisma/client";

type FeaturedPost = Post & { categories: Category[]; _count: { images: number } };

function FeaturedPostCard({ post }: { post: FeaturedPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-md transition duration-300 hover:border-ink/20 hover:shadow-xl sm:flex-row"
    >
      {/* Sotto sm: nessuna altezza forzata, l'immagine renderizza alla sua proporzione naturale
          (h-auto) — niente taglio. Da sm in su: la box si stira all'altezza della colonna di
          testo (flex row, stretch di default) e l'immagine la riempie con object-cover, che
          taglia molto meno di un aspect-video fisso ma comunque si adatta al riquadro. */}
      <div className="relative w-full shrink-0 overflow-hidden bg-cream sm:w-[400px]">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(post.coverImage, { width: 800, crop: "fill" })}
            alt={post.title}
            className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-105 sm:h-full sm:object-cover"
          />
        )}
        {hasGallery(post) && (
          <div className="absolute right-2 bottom-2">
            <GalleryBadge />
          </div>
        )}
      </div>
      <div className="relative flex flex-1 flex-col p-6 sm:p-8 md:p-10 wide:p-12">
        <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-brick text-cream shadow-sm">
          <FontAwesomeIcon icon={faThumbtack} aria-hidden="true" className="!h-3.5 !w-3.5" />
        </div>
        <div className="flex flex-wrap items-center gap-3 pr-12">
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
            <p className="font-mono shrink-0 text-xs text-ink-soft wide:text-sm">
              {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.publishedAt)}
            </p>
          )}
        </div>
        <div className="mx-auto flex max-w-[600px] flex-1 flex-col justify-center">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink transition-colors duration-200 group-hover:text-brick wide:text-3xl">
            {post.title}
          </h3>
          {post.subtitle && (
            <p className="mt-1 text-base text-ink-soft italic wide:text-lg">{post.subtitle}</p>
          )}
          {post.excerpt && (
            <p className="mt-3 text-base leading-relaxed text-ink-soft wide:text-lg">{post.excerpt}</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-end">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brick">
            Leggi di più
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="!h-3 !w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BachecaHighlight({ posts }: { posts: FeaturedPost[] }) {
  return (
    <section className="bg-cream-deep py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 wide:max-w-6xl">
        <p className="eyebrow text-brick wide:text-sm">In evidenza</p>
        <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
          Il Borgo utile
        </h2>
        {posts.length > 0 ? (
          <div className="mt-8 space-y-6">
            {posts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">Nessuna notizia pubblicata per ora.</p>
        )}
      </div>
    </section>
  );
}
