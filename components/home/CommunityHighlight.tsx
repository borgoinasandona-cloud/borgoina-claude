import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { communityPostTypeLabels, isObjectPostType, communityPostStatusLabels } from "@/lib/community";
import type { CommunityPost } from "@prisma/client";

type FeaturedCommunityPost = CommunityPost & {
  author: { name: string | null; email: string };
  _count: { comments: number };
};

export function CommunityHighlight({ post }: { post: FeaturedCommunityPost | null }) {
  if (!post) return null;

  return (
    <section className="bg-cream-deep py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 wide:max-w-6xl">
        <p className="eyebrow text-sage wide:text-sm">Dal Mercatino</p>
        <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
          In evidenza nella community
        </h2>
        
        <Link
          href={`/community/${post.slug}`}
          className="group mt-8 flex flex-col overflow-hidden rounded border border-ink/20 bg-white transition duration-300 hover:border-ink/30 hover:shadow-lg sm:flex-row"
        >
          {post.coverImage && (
            <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-cream-deep sm:w-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-6 sm:py-8 sm:pr-8 sm:pl-8">
            <div className="flex flex-wrap gap-1.5">
              <span className="font-mono rounded-sm bg-sage/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-sage uppercase">
                {communityPostTypeLabels[post.type]}
              </span>
              {isObjectPostType(post.type) && post.status && (
                <span className="font-mono rounded-sm bg-ink/5 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
                  {communityPostStatusLabels[post.status]}
                </span>
              )}
            </div>
            
            <h3 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-ink transition-colors duration-200 group-hover:text-sage wide:text-3xl">
              {post.title}
            </h3>
            
            <p className="font-mono mt-2 text-xs text-ink-soft wide:text-sm">
              Proposto da {post.author.name ?? "un socio"} ·{" "}
              {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(post.createdAt)}
            </p>

            <p className="mt-3 text-base leading-relaxed text-ink-soft line-clamp-3 wide:text-lg">
              {post.content}
            </p>

            {post._count.comments > 0 && (
              <p className="font-mono mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-sage uppercase">
                <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" aria-hidden="true" />
                {post._count.comments} {post._count.comments === 1 ? "commento" : "commenti"}
              </p>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
