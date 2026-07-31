import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getShopByAuthorId } from "@/lib/shops";
import { ShopForm } from "@/components/ShopForm";
import { deleteMyShopAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La mia bottega",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "In attesa di moderazione",
  PRIVATE: "Non pubblica",
};

export default async function MyShopPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }

  const shop = await getShopByAuthorId(session.user.id);

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
              ? "La tua pagina è pubblica."
              : "Aggiorna i dati della tua pagina. Le modifiche a una pagina già approvata restano subito visibili, senza tornare in moderazione."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {shop.visibility !== "PUBLIC" ? (
              <span className="font-mono inline-block rounded-sm bg-ink px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-cream uppercase">
                {STATUS_LABELS[shop.visibility]}
              </span>
            ) : (
              <Link
                href={`/botteghe/${shop.slug}`}
                className="text-sm font-semibold text-brick hover:text-brick-dark"
              >
                Vedi la pagina pubblica →
              </Link>
            )}
          </div>

          <ShopForm shop={shop} />

          <form action={deleteMyShopAction} className="mt-8 border-t border-ink/10 pt-6">
            <button
              type="submit"
              className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick-dark"
            >
              Elimina la mia pagina Botteghe
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            Crea la pagina di presentazione della tua attività o dei tuoi servizi. Dopo la
            pubblicazione, un admin la controlla prima che compaia su{" "}
            <Link href="/botteghe" className="font-semibold text-brick hover:text-brick-dark">
              Botteghe
            </Link>
            .
          </p>
          <ShopForm />
        </>
      )}
    </div>
  );
}
