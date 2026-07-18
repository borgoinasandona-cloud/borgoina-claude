import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Bacheca</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuovo articolo
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between py-3">
            <div>
              <p className="flex items-center gap-2 font-medium text-neutral-900">
                {post.title}
                {post.featured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    In evidenza
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                /{post.slug} · {post.visibility === "PUBLIC" ? "Pubblico" : "Privato"} ·{" "}
                {post.publishedAt
                  ? new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(post.publishedAt)
                  : "Bozza"}{" "}
                · {post.categories.map((c) => c.name).join(", ") || "nessuna categoria"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/posts/${post.id}/edit`} className="text-sm text-green-700 hover:underline">
                Modifica
              </Link>
              <form action={deletePostAction.bind(null, post.id)}>
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
                  Elimina
                </button>
              </form>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessun articolo ancora.</li>
        )}
      </ul>
    </div>
  );
}
