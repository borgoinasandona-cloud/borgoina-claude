import { prisma } from "@/lib/prisma";

export async function getActiveTokensForShop(shopId: string) {
  const tokens = await prisma.discountToken.findMany({
    where: { shopId, active: true },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return tokens
    .map((token) => ({ ...token, remaining: token.totalIssued - token._count.redemptions }))
    .filter((token) => token.remaining > 0);
}

export function getTokensForShopAdmin(shopId: string) {
  return prisma.discountToken.findMany({
    where: { shopId },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Riscatta un token per un utente. Nessun vincolo @@unique in DB a limitare i riscatti per utente
 * (scelta esplicita: uno stesso iscritto può riscattare più volte lo stesso token) — l'unico limite
 * reale è la disponibilità posti (totalIssued), garantita qui con un row lock esplicito
 * (SELECT ... FOR UPDATE) sulla riga DiscountToken: sotto l'isolamento di default di Postgres
 * (READ COMMITTED) un semplice recount dentro $transaction non basterebbe a impedire a due
 * riscatti concorrenti di leggere lo stesso conteggio stantio e superare entrambi il limite.
 */
export async function redeemToken(tokenId: string, userId: string, callerShopId: string) {
  return prisma.$transaction(async (tx) => {
    const [token] = await tx.$queryRaw<
      { id: string; shopId: string; active: boolean; totalIssued: number }[]
    >`SELECT id, "shopId", active, "totalIssued" FROM "DiscountToken" WHERE id = ${tokenId} FOR UPDATE`;

    if (!token || token.shopId !== callerShopId || !token.active) {
      throw new Error("Token non valido per questa bottega.");
    }

    const usedCount = await tx.tokenRedemption.count({ where: { tokenId } });
    if (usedCount >= token.totalIssued) {
      throw new Error("Posti esauriti per questo sconto.");
    }

    return tx.tokenRedemption.create({ data: { tokenId, userId } });
  });
}
