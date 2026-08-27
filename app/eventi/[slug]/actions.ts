"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { eventRsvpSchema } from "@/lib/validations";
import { createOrUpdateRsvp, cancelRsvp } from "@/lib/eventRsvp";

export type RsvpFormState = {
  status: "idle" | "error";
  message?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }
  return session.user;
}

export async function rsvpAction(
  slug: string,
  _prevState: RsvpFormState,
  formData: FormData,
): Promise<RsvpFormState> {
  const user = await requireUser();

  const parsed = eventRsvpSchema.safeParse({
    guests: formData.get("guests") || "0",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) {
    return { status: "error", message: "Evento non trovato." };
  }

  try {
    await createOrUpdateRsvp(event.id, user.id, parsed.data.guests, parsed.data.notes || null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante la prenotazione.";
    return { status: "error", message };
  }

  revalidatePath(`/eventi/${slug}`);
  return { status: "idle" };
}

export async function cancelRsvpAction(slug: string) {
  const user = await requireUser();

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return;

  await cancelRsvp(event.id, user.id);

  revalidatePath(`/eventi/${slug}`);
}
