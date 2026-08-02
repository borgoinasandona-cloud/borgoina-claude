import { prisma } from "@/lib/prisma";

/**
 * Elenco pubblico degli iscritti: niente email (dato sensibile, non serve per una directory
 * pubblica — chi vuole essere contattato mette i propri contatti sulla pagina Botteghe). Include
 * la bottega solo per sapere se linkarla: il filtro su visibility PUBLIC va comunque rifatto nel
 * componente, non è esprimibile pulito in una relazione 1:1 opzionale lato Prisma.
 */
export function getPublicMembers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      shop: { select: { slug: true, name: true, visibility: true } },
    },
    orderBy: { name: "asc" },
  });
}
