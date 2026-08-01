"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ShopFormState } from "@/app/community/bottega/actions";
import { parseShopFormData } from "@/lib/shops";
import { slugifyWithSuffix } from "@/lib/slugify";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

/** "" (nessuna opzione selezionata nella select) → null, altrimenti l'id scelto. */
function parseLinkedAuthorId(formData: FormData) {
  const raw = formData.get("authorId");
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
}

// Le bottege sono pubblicate subito dagli iscritti, senza moderazione preventiva: questi due
// pulsanti servono solo all'admin per nascondere/ripubblicare a posteriori un contenuto
// inappropriato, non per approvare una pubblicazione in attesa.
export async function publishShopAction(id: string) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id },
    data: { visibility: "PUBLIC" },
  });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${shop.slug}`);
}

export async function hideShopAction(id: string) {
  await requireAdmin();
  const shop = await prisma.shop.update({
    where: { id },
    data: { visibility: "PRIVATE" },
  });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${shop.slug}`);
}

export async function deleteShopAction(id: string) {
  await requireAdmin();
  await prisma.shop.delete({ where: { id } });
  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
}

// Permette all'admin di creare una bottega per conto di un titolare che magari non si è ancora
// registrato come iscritto (es. raccoglie i dati a voce/email e li inserisce lui): niente autore
// obbligatorio, solo un nome da mostrare in "Gestita da" finché non si collega un account reale.
export async function adminCreateShopAction(
  _prevState: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  await requireAdmin();

  const parsed = parseShopFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { images, ...data } = parsed.data;
  const authorId = parseLinkedAuthorId(formData);

  if (!authorId && !data.ownerName) {
    return { status: "error", message: "Inserisci il nome del gestore o collega un utente." };
  }

  let shopId: string;
  try {
    const shop = await prisma.shop.create({
      data: {
        ...data,
        authorId,
        slug: slugifyWithSuffix(data.name),
        images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
      },
    });
    shopId = shop.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "Questo utente ha già una bottega collegata." };
    }
    return { status: "error", message: "Errore di salvataggio. Riprova." };
  }

  revalidatePath("/admin/botteghe");
  revalidatePath("/botteghe");
  redirect(`/admin/botteghe/${shopId}/edit`);
}

// Permette all'admin di correggere/modificare i contenuti di una bottega altrui (es. refusi,
// contenuti da sistemare) senza dover passare dall'account dell'iscritto, e di collegarla a un
// utente (o scollegarla) in un secondo momento. Stessi campi/parsing di saveShopAction
// (parseShopFormData condivisa), ma senza vincolo di ownership: opera sull'id passato, non su
// authorId === utente loggato.
export async function adminUpdateShopAction(
  id: string,
  _prevState: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  await requireAdmin();

  const parsed = parseShopFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { images, ...data } = parsed.data;
  const authorId = parseLinkedAuthorId(formData);

  if (!authorId && !data.ownerName) {
    return { status: "error", message: "Inserisci il nome del gestore o collega un utente." };
  }

  let slug: string;
  try {
    const [, shop] = await prisma.$transaction([
      prisma.shopImage.deleteMany({ where: { shopId: id } }),
      prisma.shop.update({
        where: { id },
        data: {
          ...data,
          authorId,
          images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
        },
      }),
    ]);
    slug = shop.slug;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "Questo utente ha già una bottega collegata." };
    }
    return { status: "error", message: "Errore di salvataggio. Riprova." };
  }

  revalidatePath("/admin/botteghe");
  revalidatePath(`/admin/botteghe/${id}/edit`);
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${slug}`);

  return { status: "success", message: "Bottega aggiornata." };
}
