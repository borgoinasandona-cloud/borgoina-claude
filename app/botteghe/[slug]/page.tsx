import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faImage } from "@fortawesome/free-regular-svg-icons";
import { faPhone, faGlobe, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { getShopBySlug, shopCategoryLabels } from "@/lib/shops";

export const dynamic = "force-dynamic";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  return { title: shop?.name ?? "Bottega" };
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, shop] = await Promise.all([auth(), getShopBySlug(slug)]);

  if (!shop) {
    notFound();
  }

  const isAuthor = session?.user?.id === shop.authorId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (shop.visibility !== "PUBLIC" && !isAuthor && !isAdmin) {
    notFound();
  }

  return (
    <article>
      <header className="border-b border-ink/10 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <Link
            href="/botteghe"
            className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-brick transition-colors hover:text-brick-dark"
          >
            ← Torna a Botteghe
          </Link>

          {shop.visibility !== "PUBLIC" && (isAuthor || isAdmin) && (
            <p className="font-mono mb-3 inline-block rounded-sm bg-ink px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-cream uppercase">
              Nascosta dall&apos;admin
            </p>
          )}

          <span className="font-mono inline-block rounded-sm bg-brick/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-brick uppercase">
            {shopCategoryLabels[shop.category]}
          </span>

          <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {shop.name}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            {shop.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.author.image}
                alt=""
                className="h-12 w-12 rounded-full border-2 border-cream object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-sm font-semibold text-ink-soft">
                {initials(shop.author.name ?? "Socio")}
              </div>
            )}
            <div>
              <p className="font-mono text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
                Gestita da
              </p>
              <p className="font-semibold text-ink">{shop.author.name ?? "Socio"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 wide:max-w-4xl">
        {shop.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="mb-8 w-full rounded border border-ink/10 object-cover shadow-sm"
          />
        )}

        <p className="text-lg leading-relaxed whitespace-pre-wrap text-ink wide:text-xl">
          {shop.description}
        </p>

        {(shop.phone || shop.email || shop.website || shop.address) && (
          <div className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-base text-ink-soft">
            {shop.phone && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-brick" aria-hidden="true" />
                <a href={`tel:${shop.phone}`} className="hover:text-brick">
                  {shop.phone}
                </a>
              </p>
            )}
            {shop.email && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-brick" aria-hidden="true" />
                <a href={`mailto:${shop.email}`} className="hover:text-brick">
                  {shop.email}
                </a>
              </p>
            )}
            {shop.website && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-brick" aria-hidden="true" />
                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:text-brick">
                  {shop.website}
                </a>
              </p>
            )}
            {shop.address && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 text-brick" aria-hidden="true" />
                {shop.address}
              </p>
            )}
          </div>
        )}

        {shop.images.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow inline-flex items-center gap-1.5 text-brick">
              <FontAwesomeIcon icon={faImage} className="h-3.5 w-3.5" aria-hidden="true" />
              Galleria
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shop.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt ?? shop.name}
                  className="aspect-square w-full rounded border border-ink/10 object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
