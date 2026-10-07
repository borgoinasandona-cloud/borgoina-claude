import Link from "next/link";
import { getTokenReportForAdmin } from "@/lib/discounts";

export const dynamic = "force-dynamic";

export default async function AdminTokenReportPage() {
  const tokens = await getTokenReportForAdmin();
  const totalRedemptions = tokens.reduce((sum, token) => sum + token.redemptions.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Report token</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {tokens.length} {tokens.length === 1 ? "campagna" : "campagne"} · {totalRedemptions}{" "}
        {totalRedemptions === 1 ? "riscatto totale" : "riscatti totali"}
      </p>

      <div className="mt-8 space-y-6">
        {tokens.map((token) => {
          const used = token.redemptions.length;
          const exhausted = used >= token.totalIssued;

          return (
            <div key={token.id} className="rounded-md border border-neutral-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-neutral-900">{token.title}</p>
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
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                <Link href={`/admin/botteghe/${token.shop.id}/tokens`} className="hover:underline">
                  {token.shop.name}
                </Link>
                {" · "}
                {used} / {token.totalIssued} riscattati ·{" "}
                {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(token.createdAt)}
              </p>
              {token.description && <p className="mt-2 text-sm text-neutral-600">{token.description}</p>}

              {token.redemptions.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                        <th className="py-2 pr-4">Socio</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Riscattato il</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {token.redemptions.map((redemption) => (
                        <tr key={redemption.id}>
                          <td className="py-2 pr-4 font-medium text-neutral-900">
                            {redemption.user.name ?? "Socio"}
                          </td>
                          <td className="py-2 pr-4 text-neutral-600">{redemption.user.email}</td>
                          <td className="py-2 pr-4 text-neutral-500">
                            {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(
                              redemption.usedAt,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">Nessun riscatto ancora.</p>
              )}
            </div>
          );
        })}
        {tokens.length === 0 && (
          <p className="text-sm text-neutral-500">Nessuna campagna token creata finora.</p>
        )}
      </div>
    </div>
  );
}
