import Link from "next/link";
import { getAllShopsForAdmin, shopCategoryLabels } from "@/lib/shops";
import { publishShopAction, hideShopAction, deleteShopAction } from "./actions";

export const dynamic = "force-dynamic";

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: "Pubblico",
  PRIVATE: "Nascosto",
  PENDING: "Nascosto",
};

export default async function AdminShopsPage() {
  const shops = await getAllShopsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Botteghe</h1>
        <Link
          href="/admin/botteghe/new"
          className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
        >
          + Nuova bottega
        </Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        Pagine di presentazione create dagli iscritti (o dall&apos;admin per conto di un titolare
        non ancora iscritto). Sono pubblicate subito, senza moderazione: da qui puoi modificarne i
        contenuti, nasconderle o eliminarle.
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {shops.map((shop) => (
          <li key={shop.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="flex items-center gap-2 font-medium text-neutral-900">
                {shop.name}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    shop.visibility === "PUBLIC"
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {VISIBILITY_LABELS[shop.visibility]}
                </span>
                {!shop.author && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Non reclamata
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                /{shop.slug} · {shopCategoryLabels[shop.category]} ·{" "}
                {shop.author ? (
                  (shop.author.name ?? shop.author.email)
                ) : (
                  <span className="text-amber-700">{shop.ownerName ?? "senza nome"}</span>
                )}{" "}
                · {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(shop.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/botteghe/${shop.slug}`}
                target="_blank"
                className="text-sm text-green-700 hover:underline"
              >
                Vedi
              </Link>
              <Link href={`/admin/botteghe/${shop.id}/edit`} className="text-sm text-green-700 hover:underline">
                Modifica
              </Link>
              <Link href={`/admin/botteghe/${shop.id}/tokens`} className="text-sm text-green-700 hover:underline">
                Token
              </Link>
              {shop.visibility === "PUBLIC" ? (
                <form action={hideShopAction.bind(null, shop.id)}>
                  <button type="submit" className="text-sm text-neutral-500 hover:text-amber-700">
                    Nascondi
                  </button>
                </form>
              ) : (
                <form action={publishShopAction.bind(null, shop.id)}>
                  <button type="submit" className="text-sm text-green-700 hover:underline">
                    Pubblica
                  </button>
                </form>
              )}
              <form action={deleteShopAction.bind(null, shop.id)}>
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
                  Elimina
                </button>
              </form>
            </div>
          </li>
        ))}
        {shops.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessuna bottega ancora.</li>
        )}
      </ul>
    </div>
  );
}
