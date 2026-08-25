import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPublicShops, shopCategoryLabels } from "@/lib/shops";
import { ShopCard } from "@/components/ShopCard";
import type { ShopCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Botteghe",
};

const CATEGORY_FILTERS = Object.keys(shopCategoryLabels) as ShopCategory[];

export default async function BotteghePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const category = CATEGORY_FILTERS.includes(categoria as ShopCategory)
    ? (categoria as ShopCategory)
    : undefined;

  const [session, shops] = await Promise.all([auth(), getPublicShops({ category })]);

  return (
    <div>
      <div className="border-b border-ink/5 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl wide:max-w-6xl">
          <p className="eyebrow text-brick wide:text-sm">Tra vicini</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            Botteghe
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft wide:text-xl">
            Le attività e i servizi degli amici che orbitano nel Borgo.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={session?.user ? "/community/bottega" : "/community/login"}
              className="inline-flex items-center gap-1.5 rounded bg-brick px-5 py-2.5 text-sm font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark"
            >
              + Crea la tua pagina
            </Link>
            {session?.user && (
              <Link
                href="/community/bottega"
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick"
              >
                La mia bottega →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 wide:max-w-6xl">
        <div className="font-mono flex flex-wrap gap-2 text-xs font-semibold tracking-wide uppercase">
          <Link
            href="/botteghe"
            className={`rounded-sm border px-3 py-1.5 transition-colors ${
              !category
                ? "border-brick bg-brick text-cream"
                : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
            }`}
          >
            Tutte
          </Link>
          {CATEGORY_FILTERS.map((c) => (
            <Link
              key={c}
              href={`/botteghe?categoria=${c}`}
              className={`rounded-sm border px-3 py-1.5 transition-colors ${
                category === c
                  ? "border-brick bg-brick text-cream"
                  : "border-ink/15 text-ink-soft hover:border-brick hover:text-brick"
              }`}
            >
              {shopCategoryLabels[c]}
            </Link>
          ))}
        </div>

        {shops.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">Nessuna bottega pubblicata per ora.</p>
        )}
      </div>
    </div>
  );
}
