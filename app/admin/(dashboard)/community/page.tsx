import Link from "next/link";
import { getAllCommunityPostsForAdmin, communityPostTypeLabels, communityPostStatusLabels } from "@/lib/community";
import { approveCommunityPostAction, rejectCommunityPostAction, deleteCommunityPostAction } from "./actions";

export const dynamic = "force-dynamic";

const VISIBILITY_LABELS: Record<string, string> = {
  PENDING: "In moderazione",
  PUBLIC: "Pubblico",
  PRIVATE: "Rifiutato",
};

export default async function AdminCommunityPage() {
  const posts = await getAllCommunityPostsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Community</h1>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        Annunci pubblicati dagli iscritti (oggetti e segnalazioni). Vanno approvati prima di comparire
        sul sito pubblico.
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="flex items-center gap-2 font-medium text-neutral-900">
                {post.title}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    post.visibility === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : post.visibility === "PUBLIC"
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {VISIBILITY_LABELS[post.visibility]}
                </span>
              </p>
              <p className="text-xs text-neutral-500">
                /{post.slug} · {communityPostTypeLabels[post.type]}
                {post.status ? ` · ${communityPostStatusLabels[post.status]}` : ""} ·{" "}
                {post.author.name ?? post.author.email} ·{" "}
                {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(post.createdAt)} ·{" "}
                {post._count.comments} {post._count.comments === 1 ? "commento" : "commenti"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/community/${post.slug}`}
                target="_blank"
                className="text-sm text-green-700 hover:underline"
              >
                Vedi
              </Link>
              {post.visibility !== "PUBLIC" && (
                <form action={approveCommunityPostAction.bind(null, post.id)}>
                  <button type="submit" className="text-sm text-green-700 hover:underline">
                    Approva
                  </button>
                </form>
              )}
              {post.visibility !== "PRIVATE" && (
                <form action={rejectCommunityPostAction.bind(null, post.id)}>
                  <button type="submit" className="text-sm text-neutral-500 hover:text-amber-700">
                    Rifiuta
                  </button>
                </form>
              )}
              <form action={deleteCommunityPostAction.bind(null, post.id)}>
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
                  Elimina
                </button>
              </form>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessun annuncio ancora.</li>
        )}
      </ul>
    </div>
  );
}
