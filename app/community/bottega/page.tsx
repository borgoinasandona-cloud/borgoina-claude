import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faCamera, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { getShopByAuthorId } from "@/lib/shops";
import { getTokensForShopAdmin } from "@/lib/discounts";
import { ShopForm } from "@/components/ShopForm";
import { deleteMyShopAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La mia bottega",
};

export default async function MyShopPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }

  const shop = await getShopByAuthorId(session.user.id);
  const discountTokens = shop ? await getTokensForShopAdmin(shop.id) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
        La mia bottega
      </h1>

      {shop ? (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            {shop.visibility === "PUBLIC"
              ? "La tua pagina è pubblica. Le modifiche restano subito visibili."
              : "Un admin ha nascosto la tua pagina: non è al momento visibile su Botteghe."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {shop.visibility !== "PUBLIC" ? (
              <span className="font-mono inline-block rounded-sm bg-ink px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-cream uppercase">
                Nascosta
              </span>
            ) : (
              <Link
                href={`/botteghe/${shop.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brick hover:text-brick-dark"
              >
                Vedi la pagina pubblica
                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="h-3 w-3" />
              </Link>
            )}
          </div>

          {discountTokens.length > 0 && (
            <div className="mt-6 rounded-xl border border-brick/20 bg-brick/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow inline-flex items-center gap-1.5 text-brick">
                    <FontAwesomeIcon icon={faTag} className="h-3.5 w-3.5" aria-hidden="true" />
                    Sconti attivati
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Scansiona il QR di un socio per assegnargli uno sconto.
                  </p>
                </div>
                <Link
                  href="/scan"
                  className="inline-flex shrink-0 items-center gap-2 rounded bg-brick px-5 py-2.5 text-sm font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark"
                >
                  <FontAwesomeIcon icon={faCamera} className="h-4 w-4" aria-hidden="true" />
                  Scansiona QR
                </Link>
              </div>
              <ul className="mt-4 space-y-2">
                {discountTokens.map((token) => (
                  <li
                    key={token.id}
                    className="flex items-center justify-between gap-3 rounded border border-brick/15 bg-white px-4 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      {token.discountPct}% di sconto
                      {!token.active && (
                        <span className="font-mono rounded-sm bg-ink/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-soft uppercase">
                          Disattivato
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-ink-soft uppercase">
                      {token._count.redemptions} / {token.totalIssued} riscattati
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6 shadow-md md:p-8">
            <ShopForm shop={shop} />

            <form action={deleteMyShopAction} className="mt-8 border-t border-ink/5 pt-6">
              <button
                type="submit"
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick-dark"
              >
                Elimina la mia pagina Botteghe
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            Crea la pagina di presentazione della tua attività o dei tuoi servizi: è subito
            visibile a tutti su{" "}
            <Link href="/botteghe" className="font-semibold text-brick hover:text-brick-dark">
              Botteghe
            </Link>
            .
          </p>
          <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6 shadow-md md:p-8">
            <ShopForm />
          </div>
        </>
      )}
    </div>
  );
}
