import { prisma } from "@/lib/prisma";

export function getEventBySlug(slug: string) {
  return prisma.event.findUnique({ where: { slug } });
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
      _count: { select: { rsvps: true } },
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
