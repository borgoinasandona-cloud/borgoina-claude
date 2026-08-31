import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getShopByAuthorId } from "@/lib/shops";
import { ScanClient } from "@/components/ScanClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scansiona QR",
};

export default async function ScanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }

  const shop = await getShopByAuthorId(session.user.id);
  if (!shop) {
    redirect("/community");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">{shop.name}</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
        Scansiona QR
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Inquadra il codice QR identificativo di un socio per vedere i token disponibili e
        assegnarne uno.
      </p>

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6 shadow-md">
        <ScanClient />
      </div>
    </div>
  );
}
