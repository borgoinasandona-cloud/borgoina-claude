"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ShopFormState } from "@/app/community/bottega/actions";
import { parseShopFormData } from "@/lib/shops";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
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

// Permette all'admin di correggere/modificare i contenuti di una bottega altrui (es. refusi,
// contenuti da sistemare) senza dover passare dall'account dell'iscritto. Stessi campi/parsing di
// saveShopAction (parseShopFormData condivisa), ma senza vincolo di ownership: opera sull'id
// passato, non su authorId === utente loggato.
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

  let slug: string;
  try {
    const [, shop] = await prisma.$transaction([
      prisma.shopImage.deleteMany({ where: { shopId: id } }),
      prisma.shop.update({
        where: { id },
        data: {
          ...data,
          images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
        },
      }),
    ]);
    slug = shop.slug;
  } catch {
    return { status: "error", message: "Errore di salvataggio. Riprova." };
  }

  revalidatePath("/admin/botteghe");
  revalidatePath(`/admin/botteghe/${id}/edit`);
  revalidatePath("/botteghe");
  revalidatePath(`/botteghe/${slug}`);

  return { status: "success", message: "Bottega aggiornata." };
}
