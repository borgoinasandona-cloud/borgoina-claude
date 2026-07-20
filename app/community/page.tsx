import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPublishedCommunityPosts, communityPostTypeLabels } from "@/lib/community";
import { CommunityPostCard } from "@/components/CommunityPostCard";
import type { CommunityPostType } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community",
};

const TYPE_FILTERS = Object.keys(communityPostTypeLabels) as CommunityPostType[];

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const type = TYPE_FILTERS.includes(tipo as CommunityPostType) ? (tipo as CommunityPostType) : undefined;

  const [session, posts] = await Promise.all([auth(), getPublishedCommunityPosts({ type })]);

  return (
    <div>
      <div className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl wide:max-w-6xl">
          <p className="eyebrow text-brick wide:text-sm">Tra vicini</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            Community
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft wide:text-xl">
            Oggetti da regalare, prestare o vendere, e servizi e lavori tra chi vive nel Borgo.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={session?.user ? "/community/new" : "/community/login"}
              className="inline-flex items-center gap-1.5 rounded bg-brick px-5 py-2.5 text-sm font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark"
            >
              + Nuovo annuncio
            </Link>
            {session?.user && (
              <Link
                href="/community/account"
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick"
              >
                Il mio account →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 wide:max-w-6xl">
        <div className="font-mono flex flex-wrap gap-2 text-xs font-semibold tracking-wide uppercase">
          <Link
            href="/community"
            className={`rounded-sm border px-3 py-1.5 transition-colors ${
              !type
                ? "border-brick bg-brick text-cream"
                : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
            }`}
          >
            Tutti
          </Link>
          {TYPE_FILTERS.map((t) => (
            <Link
              key={t}
              href={`/community?tipo=${t}`}
              className={`rounded-sm border px-3 py-1.5 transition-colors ${
                type === t
                  ? "border-brick bg-brick text-cream"
                  : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
              }`}
            >
              {communityPostTypeLabels[t]}
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">Nessun annuncio pubblicato per ora.</p>
        )}
      </div>
    </div>
  );
}
