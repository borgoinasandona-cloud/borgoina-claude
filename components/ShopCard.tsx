import Link from "next/link";
import { shopCategoryLabels } from "@/lib/shops";
import { GalleryBadge } from "@/components/GalleryBadge";
import type { Shop, ShopImage } from "@prisma/client";

type CardShop = Shop & { images: ShopImage[] };

export function ShopCard({ shop }: { shop: CardShop }) {
  return (
    <Link
      href={`/botteghe/${shop.slug}`}
      className="group block overflow-hidden rounded border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-cream-deep">
        {shop.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <span className="font-mono rounded-sm bg-ink/80 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-cream uppercase backdrop-blur-sm">
            {shopCategoryLabels[shop.category]}
          </span>
        </div>
        {shop.images.length > 0 && (
          <div className="absolute right-2 bottom-2">
            <GalleryBadge />
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl font-bold text-ink transition-colors duration-200 group-hover:text-brick line-clamp-2 wide:text-2xl">
          {shop.name}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft line-clamp-3 wide:text-lg">
          {shop.description}
        </p>
      </div>
    </Link>
  );
}
