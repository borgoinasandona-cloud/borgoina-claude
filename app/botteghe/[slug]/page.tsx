import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faEnvelope, faImage, faClock } from "@fortawesome/free-regular-svg-icons";
import {
  faPhone,
  faGlobe,
  faLocationDot,
  faTag,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { auth } from "@/lib/auth";
import { getShopBySlug, shopCategoryLabels } from "@/lib/shops";
import { getActiveTokensForShop } from "@/lib/discounts";
import { DiscountBadge } from "@/components/DiscountBadge";
import { toWhatsAppNumber } from "@/lib/phone";
import { withCloudinaryTransform } from "@/lib/cloudinary-client";
import { initials } from "@/lib/initials";

export const dynamic = "force-dynamic";

function ContactCard({
  icon,
  label,
  children,
}: {
  icon: IconDefinition;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-4 shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brick/10 text-brick">
        <FontAwesomeIcon icon={icon} className="!h-4 !w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
        <p className="mt-0.5 text-sm text-ink">{children}</p>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop || shop.visibility !== "PUBLIC") return { title: "Bottega" };

  const description = shop.slogan ?? shop.description.slice(0, 200);
  const images = shop.coverImage
    ? [{ url: withCloudinaryTransform(shop.coverImage, "w_1200,h_630,c_fill") }]
    : undefined;

  return {
    title: shop.name,
    description,
    openGraph: { title: shop.name, description, images },
    twitter: { card: "summary_large_image", title: shop.name, description, images: images?.map((i) => i.url) },
  };
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

  const activeTokens = await getActiveTokensForShop(shop.id);
  const tokensRemaining = activeTokens.reduce((sum, token) => sum + token.remaining, 0);
  const tokensIssued = activeTokens.reduce((sum, token) => sum + token.totalIssued, 0);
  const hasContacts = shop.address || shop.hours || shop.email || shop.website || shop.instagram;
  // Finché non c'è un account collegato, il nome scritto dall'admin (ownerName) fa da segnaposto:
  // appena la bottega viene collegata a un utente, nome e foto del profilo prendono il sopravvento.
  const managerName = shop.author?.name ?? shop.ownerName;
  const managerImage = shop.author?.image ?? null;

  return (
    <article>
      <header className="px-4 pt-16 pb-2">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              href="/botteghe"
              className="inline-flex items-center gap-1 text-sm font-bold text-brick transition-colors hover:text-brick-dark"
            >
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" className="!h-3 !w-3" />
              Torna a Botteghe
            </Link>

            {shop.visibility !== "PUBLIC" && (isAuthor || isAdmin) && (
              <p className="font-mono inline-block rounded-sm bg-ink px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-cream uppercase">
                Nascosta dall&apos;admin
              </p>
            )}

            <span className="font-mono inline-block rounded-sm bg-brick/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-brick uppercase">
              {shopCategoryLabels[shop.category]}
            </span>
          </div>

          <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {shop.name}
          </h1>
          {shop.slogan && (
            <p className="mt-2 max-w-2xl text-lg text-brick-dark italic wide:text-xl">{shop.slogan}</p>
          )}

          {managerName && (
            <div className="mt-5 flex items-center gap-3">
              {managerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={managerImage}
                  alt=""
                  className="h-12 w-12 rounded-full border-2 border-cream object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-sm font-semibold text-ink-soft">
                  {initials(managerName)}
                </div>
              )}
              <div>
                <p className="font-mono text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
                  Gestita da
                </p>
                <p className="font-semibold text-ink">{managerName}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-12 wide:max-w-4xl">
        {shop.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="mb-8 w-full rounded border border-ink/5 object-cover shadow-sm"
          />
        )}

        {shop.phone && (
          <div className="mb-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${toWhatsAppNumber(shop.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1ebe5a]"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="!h-4 !w-4" aria-hidden="true" />
              Scrivimi su WhatsApp
            </a>
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex items-center gap-2 rounded border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brick hover:text-brick"
            >
              <FontAwesomeIcon icon={faPhone} className="!h-4 !w-4" aria-hidden="true" />
              Chiama ora
            </a>
          </div>
        )}

        {activeTokens.length > 0 && (
          <div className="mb-8 rounded-xl border border-brick/20 bg-brick/5 p-5">
            <p className="eyebrow inline-flex items-center gap-1.5 text-brick">
              <FontAwesomeIcon icon={faTag} className="!h-3.5 !w-3.5" aria-hidden="true" />
              Offerte disponibili - ({tokensRemaining} di {tokensIssued})
            </p>
            <ul className="mt-3 space-y-2">
              {activeTokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-start justify-between gap-3 rounded border border-brick/15 bg-white px-4 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{token.title}</span>
                    {token.description && (
                      <span className="mt-0.5 block text-sm text-ink-soft">{token.description}</span>
                    )}
                  </span>
                  <DiscountBadge remaining={token.remaining} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">
              Mostra il tuo QR personale (<span className="font-mono">Il mio account</span>{" "}
              → Tessera digitale) al gestore per riscattare un&apos;offerta.
            </p>
          </div>
        )}

        <p className="eyebrow text-brick">Chi siamo</p>
        <p className="mt-3 text-lg leading-relaxed whitespace-pre-wrap text-ink wide:text-xl">
          {shop.description}
        </p>

        {shop.history && (
          <div className="mt-6">
            <p className="font-display text-lg font-bold text-ink">La nostra storia</p>
            <p className="mt-2 leading-relaxed whitespace-pre-wrap text-ink-soft">{shop.history}</p>
          </div>
        )}

        {shop.whyChooseUs && (
          <div className="mt-6">
            <p className="font-display text-lg font-bold text-ink">Perché sceglierci</p>
            <p className="mt-2 leading-relaxed whitespace-pre-wrap text-ink-soft">{shop.whyChooseUs}</p>
          </div>
        )}

        {hasContacts && (
          <div className="mt-10 border-t border-ink/5 pt-6">
            <p className="eyebrow text-brick">Contatti</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {shop.address && (
                <ContactCard icon={faLocationDot} label="Indirizzo">
                  {shop.address}
                </ContactCard>
              )}
              {shop.hours && (
                <ContactCard icon={faClock} label="Orari">
                  <span className="whitespace-pre-wrap">{shop.hours}</span>
                </ContactCard>
              )}
              {shop.email && (
                <ContactCard icon={faEnvelope} label="Email">
                  <a href={`mailto:${shop.email}`} className="hover:text-brick">
                    {shop.email}
                  </a>
                </ContactCard>
              )}
              {shop.website && (
                <ContactCard icon={faGlobe} label="Sito web">
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all hover:text-brick"
                  >
                    {shop.website}
                  </a>
                </ContactCard>
              )}
              {shop.instagram && (
                <ContactCard icon={faInstagram} label="Instagram">
                  <a
                    href={shop.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brick"
                  >
                    Apri il profilo
                    <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="!h-3 !w-3" />
                  </a>
                </ContactCard>
              )}
            </div>
          </div>
        )}

        {shop.images.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow inline-flex items-center gap-1.5 text-brick">
              <FontAwesomeIcon icon={faImage} className="!h-3.5 !w-3.5" aria-hidden="true" />
              Galleria
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shop.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt ?? shop.name}
                  className="aspect-square w-full rounded border border-ink/5 object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
