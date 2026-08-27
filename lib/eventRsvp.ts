import { prisma } from "@/lib/prisma";

/**
 * Crea o aggiorna la prenotazione di un utente per un evento. Il vincolo "una prenotazione per
 * utente" è garantito dal DB (@@unique([eventId, userId]) + upsert). Il limite maxSeats invece
 * non ha un vincolo DB a fare da rete di sicurezza: sotto l'isolamento di default di Postgres
 * (READ COMMITTED) un semplice recount dentro $transaction non basterebbe a impedire a due
 * prenotazioni concorrenti vicino al limite di leggere lo stesso conteggio stantio e superarlo
 * entrambe — per questo la riga Event viene bloccata esplicitamente (SELECT ... FOR UPDATE),
 * stesso pattern già usato in lib/discounts.ts → redeemToken() per il limite totalIssued.
 */
export async function createOrUpdateRsvp(
  eventId: string,
  userId: string,
  guests: number,
  notes: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const [event] = await tx.$queryRaw<
      { id: string; maxSeats: number | null; date: Date }[]
    >`SELECT id, "maxSeats", date FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

    if (!event) {
      throw new Error("Evento non trovato.");
    }
    if (event.date < new Date()) {
      throw new Error("L'evento è già passato.");
    }

    if (event.maxSeats !== null) {
      const others = await tx.eventRsvp.aggregate({
        where: { eventId, userId: { not: userId } },
        _sum: { guests: true },
        _count: true,
      });
      const seatsUsedByOthers = others._count + (others._sum.guests ?? 0);
      const requested = 1 + guests;
      if (seatsUsedByOthers + requested > event.maxSeats) {
        throw new Error("Posti esauriti.");
      }
    }

    return tx.eventRsvp.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, guests, notes },
      update: { guests, notes },
    });
  });
}

export async function cancelRsvp(eventId: string, userId: string) {
  await prisma.eventRsvp.deleteMany({ where: { eventId, userId } });
}
