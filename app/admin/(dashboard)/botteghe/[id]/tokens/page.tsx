import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopByIdForAdmin } from "@/lib/shops";
import { getTokensForShopAdmin } from "@/lib/discounts";
import { TokenForm } from "@/components/TokenForm";
import { toggleActiveAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminShopTokensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await getShopByIdForAdmin(id);

  if (!shop) {
    notFound();
  }

  const tokens = await getTokensForShopAdmin(id);

  return (
    <div>
      <Link href="/admin/botteghe" className="text-sm text-green-700 hover:underline">
        ← Torna a Botteghe
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Offerte — {shop.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Offerte concordate con l&apos;attività (sconti, omaggi, ecc.) da assegnare scansionando il
        QR identificativo dei soci in <span className="font-mono">/scan</span>. Ogni offerta è una
        campagna a sé: un socio può riscattarla una sola volta, la quantità va decisa in base
        all&apos;accordo con l&apos;attività.
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {tokens.map((token) => {
          const used = token._count.redemptions;
          const exhausted = used >= token.totalIssued;
          return (
            <li key={token.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="flex items-center gap-2 font-medium text-neutral-900">
                  {token.title}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      token.active
                        ? exhausted
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {token.active ? (exhausted ? "Esaurito" : "Attivo") : "Disattivato"}
                  </span>
                </p>
                {token.description && <p className="mt-0.5 text-sm text-neutral-600">{token.description}</p>}
                <p className="text-xs text-neutral-500">
                  {used} / {token.totalIssued} riscattati ·{" "}
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(token.createdAt)}
                </p>
              </div>
              <form action={toggleActiveAction.bind(null, id, token.id)}>
                <button type="submit" className="text-sm text-neutral-500 hover:text-amber-700">
                  {token.active ? "Disattiva" : "Riattiva"}
                </button>
              </form>
            </li>
          );
        })}
        {tokens.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessuna offerta ancora creata.</li>
        )}
      </ul>

      <TokenForm shopId={id} />
    </div>
  );
}
