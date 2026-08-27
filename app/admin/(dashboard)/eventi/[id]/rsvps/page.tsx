import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventByIdForAdmin, getRsvpsForEventAdmin } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function AdminEventRsvpsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventByIdForAdmin(id);

  if (!event) {
    notFound();
  }

  const rsvps = await getRsvpsForEventAdmin(id);

  return (
    <div>
      <Link href="/admin/eventi" className="text-sm text-green-700 hover:underline">
        ← Torna a Eventi
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Prenotazioni — {event.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {rsvps.length} {rsvps.length === 1 ? "prenotazione" : "prenotazioni"} ·{" "}
        {new Intl.DateTimeFormat("it-IT", { dateStyle: "full", timeStyle: "short" }).format(event.date)}
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Ospiti</th>
              <th className="py-2 pr-4">Note</th>
              <th className="py-2 pr-4">Prenotato il</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rsvps.map((rsvp) => (
              <tr key={rsvp.id}>
                <td className="py-2 pr-4 font-medium text-neutral-900">{rsvp.user.name ?? "Socio"}</td>
                <td className="py-2 pr-4 text-neutral-600">{rsvp.user.email}</td>
                <td className="py-2 pr-4 text-neutral-600">{rsvp.guests}</td>
                <td className="py-2 pr-4 whitespace-pre-wrap text-neutral-600">{rsvp.notes || "—"}</td>
                <td className="py-2 pr-4 text-neutral-500">
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(rsvp.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rsvps.length === 0 && <p className="py-6 text-sm text-neutral-500">Nessuna prenotazione ancora.</p>}
      </div>
    </div>
  );
}
