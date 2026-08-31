"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShopByAuthorId } from "@/lib/shops";
import { verifySignedUserId } from "@/lib/qr";
import { getActiveTokensForShop, redeemToken } from "@/lib/discounts";

async function requireOwnShop() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  const shop = await getShopByAuthorId(session.user.id);
  if (!shop) {
    throw new Error("Nessuna bottega collegata a questo account.");
  }
  return shop;
}

export type ScanResult =
  | { status: "error"; message: string }
  | {
      status: "ok";
      customerId: string;
      customerName: string;
      tokens: { id: string; title: string; description: string | null; remaining: number }[];
    };

export async function verifyAndListTokensAction(qrValue: string): Promise<ScanResult> {
  const shop = await requireOwnShop();

  const customerId = verifySignedUserId(qrValue);
  if (!customerId) {
    return { status: "error", message: "QR non valido." };
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId }, select: { name: true } });
  if (!customer) {
    return { status: "error", message: "Utente non trovato." };
  }

  // Esclude le offerte che questo socio ha già riscattato (una sola volta per campagna, vedi
  // @@unique([tokenId, userId])) — non ha senso proporle di nuovo al gestore.
  const tokens = await getActiveTokensForShop(shop.id, customerId);

  return {
    status: "ok",
    customerId,
    customerName: customer.name ?? "Socio",
    tokens: tokens.map((t) => ({ id: t.id, title: t.title, description: t.description, remaining: t.remaining })),
  };
}

export type RedeemResult = { status: "error"; message: string } | { status: "ok" };

export async function redeemTokenAction(tokenId: string, customerId: string): Promise<RedeemResult> {
  const shop = await requireOwnShop();

  try {
    await redeemToken(tokenId, customerId, shop.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante il riscatto.";
    return { status: "error", message };
  }

  return { status: "ok" };
}
