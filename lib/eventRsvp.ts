import { prisma } from "@/lib/prisma";

/**
 * Crea o aggiorna la prenotazione di un utente per un evento. Il vincolo "una prenotazione per
 * utente" è garantito dal DB (@@unique([eventId, userId]) + upsert) — nessun limite posti, quindi
 * nessun bisogno di un lock esplicito qui (a differenza di lib/discounts.ts → redeemToken(), che
 * protegge un totalIssued reale).
 */
export async function createOrUpdateRsvp(
  eventId: string,
  userId: string,
  guests: number,
  notes: string | null,
) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { date: true } });

  if (!event) {
    throw new Error("Evento non trovato.");
  }
  if (event.date < new Date()) {
    throw new Error("L'evento è già passato.");
  }

  return prisma.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: { eventId, userId, guests, notes },
    update: { guests, notes },
  });
}

export async function cancelRsvp(eventId: string, userId: string) {
  await prisma.eventRsvp.deleteMany({ where: { eventId, userId } });
}
