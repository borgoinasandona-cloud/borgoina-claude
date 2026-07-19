import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getCommunityPostBySlug,
  communityPostTypeLabels,
  communityPostStatusLabels,
  filterVisibleComments,
  isObjectPostType,
} from "@/lib/community";
import { CommentForm } from "@/components/CommentForm";
import { updateOwnPostStatusAction, deleteOwnPostAction } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCommunityPostBySlug(slug);
  return { title: post?.title ?? "Annuncio" };
}

export default async function CommunityPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, post] = await Promise.all([auth(), getCommunityPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const viewerId = session?.user?.id ?? null;
  const isAuthor = viewerId === post.authorId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (post.visibility !== "PUBLIC" && !isAuthor && !isAdmin) {
    notFound();
  }

  const visibleComments = filterVisibleComments(post, post.comments, viewerId);
  const isObject = isObjectPostType(post.type);

  return (
    <article>
      <header className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <Link
            href="/community"
            className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-brick transition-colors hover:text-brick-dark"
          >
            ← Torna alla Community
          </Link>

          {post.visibility !== "PUBLIC" && (isAuthor || isAdmin) && (
            <p className="font-mono mb-3 inline-block rounded-sm bg-ink px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-cream uppercase">
              {post.visibility === "PENDING" ? "In attesa di moderazione" : "Non pubblico"}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <span className="font-mono rounded-sm bg-brick/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-brick uppercase">
              {communityPostTypeLabels[post.type]}
            </span>
            {isObject && post.status && (
              <span className="font-mono rounded-sm bg-ink/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
                {communityPostStatusLabels[post.status]}
              </span>
            )}
          </div>

          <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {post.title}
          </h1>
          <p className="font-mono mt-3 text-sm text-ink-soft">
            {post.author.name ?? "Socio"} ·{" "}
            {new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(post.createdAt)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 wide:max-w-4xl">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mb-8 w-full rounded border border-ink/10 object-cover shadow-sm"
          />
        )}

        <p className="text-lg leading-relaxed whitespace-pre-wrap text-ink wide:text-xl">
          {post.content}
        </p>

        {isAuthor && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
            {isObject && (
              <form action={updateOwnPostStatusAction.bind(null, slug)} className="flex items-center gap-2">
                <select
                  name="status"
                  defaultValue={post.status ?? "AVAILABLE"}
                  className="rounded border border-ink/15 bg-cream px-2 py-1.5 text-sm text-ink"
                >
                  {Object.entries(communityPostStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded border border-ink/15 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-brick hover:text-brick"
                >
                  Aggiorna stato
                </button>
              </form>
            )}
            <form action={deleteOwnPostAction.bind(null, slug)}>
              <button
                type="submit"
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick-dark"
              >
                Elimina annuncio
              </button>
            </form>
          </div>
        )}

        <div className="mt-12 border-t border-ink/10 pt-8">
          <p className="eyebrow text-brick">💬 Commenti</p>

          {post.visibilityOfComments === "AUTHOR_ONLY" && !isAuthor && (
            <p className="mt-2 text-sm text-ink-soft">
              Su questo tipo di annuncio i commenti sono visibili solo a te e all&apos;autore.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="rounded border border-ink/10 bg-cream-deep p-4">
                <p className="font-mono text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  {comment.author.name ?? "Socio"} ·{" "}
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(comment.createdAt)}
                </p>
                <p className="mt-1 text-base whitespace-pre-wrap text-ink">{comment.content}</p>
              </div>
            ))}
            {visibleComments.length === 0 && (
              <p className="text-sm text-ink-soft">Nessun commento ancora.</p>
            )}
          </div>

          {session?.user ? (
            <CommentForm slug={slug} />
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              <Link href="/community/login" className="font-semibold text-brick hover:text-brick-dark">
                Accedi
              </Link>{" "}
              per lasciare un commento.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
