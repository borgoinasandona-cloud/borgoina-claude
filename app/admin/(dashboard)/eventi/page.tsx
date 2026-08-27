import Link from "next/link";
import { getAllEventsForAdmin } from "@/lib/events";
import { deleteEventAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getAllEventsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Eventi</h1>
        <Link
          href="/admin/eventi/new"
          className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
        >
          + Nuovo evento
        </Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        Sistema di prenotazione (RSVP) per gli eventi del Borgo. Ogni evento è raggiungibile solo
        con il link diretto (nessun elenco pubblico) — condividilo dove preferisci.
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {events.map((event) => {
          const isPast = event.date < new Date();
          return (
            <li key={event.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="flex items-center gap-2 font-medium text-neutral-900">
                  {event.title}
                  {isPast && (
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                      Passato
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  /eventi/{event.slug} ·{" "}
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(
                    event.date,
                  )}{" "}
                  · {event._count.rsvps} {event._count.rsvps === 1 ? "prenotazione" : "prenotazioni"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/eventi/${event.slug}`}
                  target="_blank"
                  className="text-sm text-green-700 hover:underline"
                >
                  Vedi
                </Link>
                <Link href={`/admin/eventi/${event.id}/edit`} className="text-sm text-green-700 hover:underline">
                  Modifica
                </Link>
                <Link href={`/admin/eventi/${event.id}/rsvps`} className="text-sm text-green-700 hover:underline">
                  Prenotazioni
                </Link>
                <form action={deleteEventAction.bind(null, event.id)}>
                  <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
                    Elimina
                  </button>
                </form>
              </div>
            </li>
          );
        })}
        {events.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessun evento ancora.</li>
        )}
      </ul>
    </div>
  );
}
