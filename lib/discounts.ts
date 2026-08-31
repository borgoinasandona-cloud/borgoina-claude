import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// excludeRedeemedByUserId: usato da /scan (app/scan/actions.ts) per non proporre al gestore un
// token che quel socio specifico ha già riscattato (fallirebbe comunque per @@unique, ma è più
// chiaro non mostrarlo affatto invece di far scoprire l'errore al tap). La pagina pubblica della
// bottega (app/botteghe/[slug]/page.tsx) chiama questa funzione senza userId, quindi mostra tutti
// i token attivi con posti residui indipendentemente da chi li ha già riscattati.
export async function getActiveTokensForShop(shopId: string, excludeRedeemedByUserId?: string) {
  const tokens = await prisma.discountToken.findMany({
    where: { shopId, active: true },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });

  let withRemaining = tokens
    .map((token) => ({ ...token, remaining: token.totalIssued - token._count.redemptions }))
    .filter((token) => token.remaining > 0);

  if (excludeRedeemedByUserId) {
    const alreadyRedeemed = await prisma.tokenRedemption.findMany({
      where: { userId: excludeRedeemedByUserId, tokenId: { in: withRemaining.map((t) => t.id) } },
      select: { tokenId: true },
    });
    const redeemedIds = new Set(alreadyRedeemed.map((r) => r.tokenId));
    withRemaining = withRemaining.filter((token) => !redeemedIds.has(token.id));
  }

  return withRemaining;
}

export function getTokensForShopAdmin(shopId: string) {
  return prisma.discountToken.findMany({
    where: { shopId },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Riscatta un token per un utente. Il limite totale (totalIssued) è garantito con un row lock
 * esplicito (SELECT ... FOR UPDATE) sulla riga DiscountToken: sotto l'isolamento di default di
 * Postgres (READ COMMITTED) un semplice recount dentro $transaction non basterebbe a impedire a
 * due riscatti concorrenti (di utenti diversi) di leggere lo stesso conteggio stantio e superare
 * entrambi il limite. Il limite "un solo riscatto per utente per questa campagna" è invece
 * garantito direttamente dal vincolo @@unique([tokenId, userId]) sul DB — non serve altro codice
 * per quello, basta gestire la violazione (P2002) con un messaggio leggibile.
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
      throw new Error("Posti esauriti per questa offerta.");
    }

    try {
      return await tx.tokenRedemption.create({ data: { tokenId, userId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Questo socio ha già riscattato questa offerta.");
      }
      throw error;
    }
  });
}
