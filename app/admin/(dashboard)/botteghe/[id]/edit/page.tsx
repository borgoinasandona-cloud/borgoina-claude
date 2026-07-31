import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopByIdForAdmin } from "@/lib/shops";
import { ShopForm } from "@/components/ShopForm";
import { adminUpdateShopAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminEditShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await getShopByIdForAdmin(id);

  if (!shop) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/botteghe" className="text-sm text-green-700 hover:underline">
        ← Torna a Botteghe
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Modifica bottega</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Bottega di {shop.author.name ?? shop.author.email}. Le modifiche sono immediate, senza
        alcuna moderazione aggiuntiva.
      </p>
      <ShopForm shop={shop} action={adminUpdateShopAction.bind(null, shop.id)} />
    </div>
  );
}
