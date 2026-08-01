import Link from "next/link";
import { getAssignableUsers } from "@/lib/shops";
import { ShopForm } from "@/components/ShopForm";
import { adminCreateShopAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminNewShopPage() {
  const assignableUsers = await getAssignableUsers();

  return (
    <div>
      <Link href="/admin/botteghe" className="text-sm text-green-700 hover:underline">
        ← Torna a Botteghe
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Nuova bottega</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Crea una pagina per conto di un titolare, con i dati che ti ha fornito. Se non è ancora
        iscritto, basta il nome del gestore — potrai collegarla al suo account in un secondo
        momento da questa stessa pagina.
      </p>
      <ShopForm action={adminCreateShopAction} assignableUsers={assignableUsers} />
    </div>
  );
}
