"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export type EventFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

// La stringa arriva da un <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"), senza fuso orario.
// new Date(...) la interpreta come orario locale del runtime che esegue questo codice — lo stesso
// runtime che poi la ri-formatta in pubblico (vedi app/eventi/[slug]/page.tsx, che non specifica
// mai un timeZone esplicito): l'orario digitato dall'admin e quello mostrato ai soci coincidono
// sempre, per costruzione, indipendentemente dal fuso orario reale del server. Non adatto a un
// pubblico multi-fuso, ma sufficiente per un comitato di quartiere locale.
function parseEventFormData(formData: FormData) {
  return eventSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description") || "",
    date: formData.get("date"),
    notesLabel: formData.get("notesLabel") || "",
  });
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { date, description, notesLabel, ...data } = parsed.data;

  let eventId: string;
  try {
    const event = await prisma.event.create({
      data: {
        ...data,
        description: description || null,
        notesLabel: notesLabel || null,
        date: new Date(date),
      },
    });
    eventId = event.id;
  } catch {
    return { status: "error", message: "Slug già esistente o errore di salvataggio." };
  }

  revalidatePath("/admin/eventi");
  redirect(`/admin/eventi/${eventId}/edit`);
}

export async function updateEventAction(
  id: string,
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { date, description, notesLabel, ...data } = parsed.data;

  try {
    await prisma.event.update({
      where: { id },
      data: {
        ...data,
        description: description || null,
        notesLabel: notesLabel || null,
        date: new Date(date),
      },
    });
  } catch {
    return { status: "error", message: "Slug già esistente o errore di salvataggio." };
  }

  revalidatePath("/admin/eventi");
  revalidatePath(`/eventi/${parsed.data.slug}`);
  revalidatePath(`/admin/eventi/${id}/edit`);

  return { status: "success", message: "Evento salvato." };
}

export async function deleteEventAction(id: string) {
  await requireAdmin();
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/eventi");
}
