import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getEventBySlug, getEventRsvpForUser } from "@/lib/events";
import { EventRsvpForm } from "@/components/EventRsvpForm";
import { cancelRsvpAction } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento" };

  return {
    title: event.title,
    description: event.description ?? undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, event] = await Promise.all([auth(), getEventBySlug(slug)]);

  if (!event) {
    notFound();
  }

  const isPast = event.date < new Date();
  const existingRsvp = session?.user?.id ? await getEventRsvpForUser(event.id, session.user.id) : null;

  return (
    <article>
      <header className="px-4 pt-16 pb-2">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <p className="eyebrow text-brick wide:text-sm">Evento</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            {event.title}
          </h1>
          <p className="font-mono mt-3 text-sm text-ink-soft">
            {new Intl.DateTimeFormat("it-IT", { dateStyle: "full", timeStyle: "short" }).format(event.date)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-12 wide:max-w-4xl">
        {event.description && (
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-ink wide:text-xl">
            {event.description}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-ink/10 bg-white p-6 shadow-md md:p-8">
          {isPast ? (
            <div>
              <p className="font-semibold text-ink">Questo evento è già passato.</p>
              {existingRsvp && (
                <p className="mt-2 text-sm text-ink-soft">
                  Eri prenotato con {existingRsvp.guests}{" "}
                  {existingRsvp.guests === 1 ? "accompagnatore" : "accompagnatori"}.
                </p>
              )}
            </div>
          ) : !session?.user ? (
            <p className="text-sm text-ink-soft">
              <Link href="/community/login" className="font-semibold text-brick hover:text-brick-dark">
                Accedi
              </Link>{" "}
              per prenotarti a questo evento.
            </p>
          ) : (
            <div>
              {existingRsvp && (
                <p className="mb-4 inline-block rounded-sm bg-sage/20 px-3 py-1 text-sm font-semibold text-ink">
                  Sei prenotato — {existingRsvp.guests}{" "}
                  {existingRsvp.guests === 1 ? "accompagnatore" : "accompagnatori"}
                </p>
              )}

              <EventRsvpForm slug={slug} notesLabel={event.notesLabel} existingRsvp={existingRsvp} />

              {existingRsvp && (
                <form action={cancelRsvpAction.bind(null, slug)} className="mt-4">
                  <button type="submit" className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick-dark">
                    Annulla prenotazione
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
