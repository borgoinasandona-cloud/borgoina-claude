"use client";

import { useActionState, useState } from "react";
import type { Shop, ShopImage } from "@prisma/client";
import { saveShopAction, type ShopFormState } from "@/app/community/bottega/actions";
import { ImageUploader, type CloudinaryUploadResult } from "@/components/ImageUploader";
import { shopCategoryLabels } from "@/lib/shops";

type GalleryImage = { url: string; alt: string; order: number };

const initialState: ShopFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function ShopForm({ shop }: { shop?: Shop & { images: ShopImage[] } }) {
  const isEdit = Boolean(shop);
  const [state, formAction, pending] = useActionState(saveShopAction, initialState);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Telefono
          </label>
          <input id="phone" name="phone" type="tel" defaultValue={shop?.phone ?? ""} className={inputClass} />
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
            Sito web / social
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
          <label htmlFor="address" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Indirizzo
          </label>
          <input id="address" name="address" type="text" defaultValue={shop?.address ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Immagine di copertina
        </span>
        <div className="mt-2 flex items-center gap-4">
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-20 w-32 rounded border border-ink/10 object-cover" />
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
              <img src={image.url} alt={image.alt} className="aspect-square w-full rounded border border-ink/10 object-cover" />
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
        {pending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Pubblica (in moderazione)"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
