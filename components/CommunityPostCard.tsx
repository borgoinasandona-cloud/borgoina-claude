import Link from "next/link";
import { communityPostTypeLabels, communityPostStatusLabels, isObjectPostType } from "@/lib/community";
import type { CommunityPost } from "@prisma/client";

type CardPost = CommunityPost & {
  author: { name: string | null };
  _count: { comments: number };
};

export function CommunityPostCard({ post }: { post: CardPost }) {
  return (
    <Link
      href={`/community/${post.slug}`}
      className="group block overflow-hidden rounded border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-cream-deep">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <span className="font-mono rounded-sm bg-ink/80 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-cream uppercase backdrop-blur-sm">
            {communityPostTypeLabels[post.type]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl font-bold text-ink transition-colors duration-200 group-hover:text-brick line-clamp-2 wide:text-2xl">
          {post.title}
        </h2>
        <p className="font-mono mt-2 text-xs text-ink-soft wide:text-sm">
          {post.author.name ?? "Socio"} ·{" "}
          {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(post.createdAt)}
          {isObjectPostType(post.type) && post.status && ` · ${communityPostStatusLabels[post.status]}`}
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-soft line-clamp-3 wide:text-lg">
          {post.content}
        </p>
        {post._count.comments > 0 && (
          <p className="font-mono mt-3 text-xs font-semibold tracking-wide text-brick uppercase">
            💬 {post._count.comments} {post._count.comments === 1 ? "commento" : "commenti"}
          </p>
        )}
      </div>
    </Link>
  );
}
