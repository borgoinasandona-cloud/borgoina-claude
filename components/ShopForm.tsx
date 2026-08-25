"use client";

import { useActionState, useState } from "react";
import type { Shop, ShopImage } from "@prisma/client";
import { saveShopAction, type ShopFormState } from "@/app/community/bottega/actions";
import { ImageUploader, type CloudinaryUploadResult } from "@/components/ImageUploader";
import { shopCategoryLabels } from "@/lib/shops";

type GalleryImage = { url: string; alt: string; order: number };

const initialState: ShopFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow border-t border-ink/5 pt-6 text-brick">{children}</p>;
}

type AssignableUser = { id: string; name: string | null; email: string };

export function ShopForm({
  shop,
  action = saveShopAction,
  assignableUsers,
}: {
  shop?: Shop & { images: ShopImage[] };
  // Di default il proprietario salva la propria bottega (saveShopAction). L'admin passa invece
  // adminCreateShopAction/adminUpdateShopAction — vedi app/admin/(dashboard)/botteghe/.
  action?: (prevState: ShopFormState, formData: FormData) => Promise<ShopFormState>;
  // Presente solo quando il form è usato dall'admin: mostra i campi "nome del gestore" e "utente
  // collegato", assenti nel form che l'iscritto usa per la propria bottega (dove l'autore è
  // sempre e solo la sessione corrente).
  assignableUsers?: AssignableUser[];
}) {
  const isEdit = Boolean(shop);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [coverImage, setCoverImage] = useState(shop?.coverImage ?? "");
  const [images, setImages] = useState<GalleryImage[]>(
    shop?.images.map((img) => ({ url: img.url, alt: img.alt ?? "", order: img.order })) ?? [],
  );

  function addGalleryImage(result: CloudinaryUploadResult) {
    setImages((prev) => [...prev, { url: result.secureUrl, alt: "", order: prev.length }]);
  }

  function removeGalleryImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  }

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Nome dell&apos;attività
        </label>
        <input id="name" name="name" type="text" required defaultValue={shop?.name} className={inputClass} />
      </div>

      <div>
        <label htmlFor="category" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Categoria
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={shop?.category ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Scegli…
          </option>
          {Object.entries(shopCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {assignableUsers && (
        <>
          <SectionHeading>Gestita da (solo admin)</SectionHeading>

          <div>
            <label htmlFor="ownerName" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Nome del gestore
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              placeholder="Es. Mario Rossi — usato finché non colleghi un account qui sotto"
              defaultValue={shop?.ownerName ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="authorId" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Utente collegato (facoltativo)
            </label>
            <select id="authorId" name="authorId" defaultValue={shop?.authorId ?? ""} className={inputClass}>
              <option value="">— Nessuno —</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name ? `${user.name} (${user.email})` : user.email}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-soft">
              Se lo colleghi, &quot;Gestita da&quot; mostrerà nome e foto profilo di questo account
              al posto del nome scritto sopra.
            </p>
          </div>
        </>
      )}

      <SectionHeading>Chi siamo</SectionHeading>

      <div>
        <label htmlFor="slogan" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Slogan
        </label>
        <input
          id="slogan"
          name="slogan"
          type="text"
          placeholder="Una frase corta e rappresentativa"
          defaultValue={shop?.slogan ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Descrizione e servizi
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          defaultValue={shop?.description}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="history" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Da quanti anni esiste / storia
        </label>
        <textarea
          id="history"
          name="history"
          rows={3}
          placeholder="Es. aperto da mio padre nel 1990, ora ci sono io con mia sorella"
          defaultValue={shop?.history ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="whyChooseUs" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Perché sceglierci
        </label>
        <textarea
          id="whyChooseUs"
          name="whyChooseUs"
          rows={3}
          placeholder="Es. usiamo solo farine locali a km0 della zona di San Donà"
          defaultValue={shop?.whyChooseUs ?? ""}
          className={inputClass}
        />
      </div>

      <SectionHeading>Contatti</SectionHeading>

      <div>
        <label htmlFor="address" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Indirizzo
        </label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="Es. Via Roma 12"
          defaultValue={shop?.address ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Telefono / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Es. 340 1234567"
            defaultValue={shop?.phone ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Email
          </label>
          <input id="email" name="email" type="email" defaultValue={shop?.email ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Sito web
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://…"
            defaultValue={shop?.website ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="instagram" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Canale Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            placeholder="https://instagram.com/…"
            defaultValue={shop?.instagram ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="hours" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Orari
        </label>
        <textarea
          id="hours"
          name="hours"
          rows={2}
          placeholder="Es. Lun-Sab 7:00-13:00 e 16:00-19:30, Domenica chiuso"
          defaultValue={shop?.hours ?? ""}
          className={inputClass}
        />
      </div>

      <div className="border-t border-ink/5 pt-6">
        <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Immagine di copertina
        </span>
        <div className="mt-2 flex items-center gap-4">
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-20 w-32 rounded border border-ink/5 object-cover" />
          )}
          <ImageUploader
            label={coverImage ? "Sostituisci copertina" : "Carica copertina"}
            labelClassName="inline-flex cursor-pointer items-center rounded border border-ink/15 bg-cream px-3 py-2 text-sm font-medium text-ink-soft hover:border-brick hover:text-brick"
            onUploaded={(result) => setCoverImage(result.secureUrl)}
          />
        </div>
        <input type="hidden" name="coverImage" value={coverImage} />
      </div>

      <div>
        <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Galleria immagini
        </span>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.url + index} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.alt} className="aspect-square w-full rounded border border-ink/5 object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 rounded-full bg-white/90 px-1.5 text-xs text-brick-dark shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ImageUploader
            label="Aggiungi immagine alla galleria"
            labelClassName="inline-flex cursor-pointer items-center rounded border border-ink/15 bg-cream px-3 py-2 text-sm font-medium text-ink-soft hover:border-brick hover:text-brick"
            onUploaded={addGalleryImage}
          />
        </div>
        <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Pubblica la pagina"}
      </button>

      {state.status === "success" && state.message && (
        <p className="text-sm font-medium text-sage-dark">{state.message}</p>
      )}
      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
