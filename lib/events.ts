import { prisma } from "@/lib/prisma";

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { rsvps: { select: { guests: true } } },
  });
  if (!event) return null;

  const { rsvps, ...rest } = event;
  const seatsTaken = rsvps.reduce((sum, rsvp) => sum + 1 + rsvp.guests, 0);

  return {
    ...rest,
    seatsTaken,
    seatsRemaining: rest.maxSeats !== null ? Math.max(0, rest.maxSeats - seatsTaken) : null,
  };
}

export function getEventRsvpForUser(eventId: string, userId: string) {
  return prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
}

export function getEventByIdForAdmin(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export function getAllEventsForAdmin() {
  return prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      rsvps: { select: { guests: true } },
    },
  });
}

export function getRsvpsForEventAdmin(eventId: string) {
  return prisma.eventRsvp.findMany({
    where: { eventId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}
