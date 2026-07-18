"use client";

import { useActionState, useState } from "react";
import type { Category, Post, PostImage } from "@prisma/client";
import {
  createPostAction,
  updatePostAction,
  type PostFormState,
} from "@/app/admin/(dashboard)/posts/actions";
import { ImageUploader, type CloudinaryUploadResult } from "@/components/ImageUploader";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";

type PostWithRelations = Post & { categories: Category[]; images: PostImage[] };
type GalleryImage = { url: string; alt: string; order: number };

const initialState: PostFormState = { status: "idle" };

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function PostForm({
  categories,
  post,
}: {
  categories: Category[];
  post?: PostWithRelations;
}) {
  const isEdit = Boolean(post);
  const action = isEdit ? updatePostAction.bind(null, post!.id) : createPostAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [images, setImages] = useState<GalleryImage[]>(
    post?.images.map((img) => ({ url: img.url, alt: img.alt ?? "", order: img.order })) ?? [],
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    post?.categories.map((c) => c.id) ?? [],
  );

  function addGalleryImage(result: CloudinaryUploadResult) {
    setImages((prev) => [...prev, { url: result.secureUrl, alt: "", order: prev.length }]);
  }

  function removeGalleryImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  const coverPreview = coverImage ? cloudinaryPreviewUrl(coverImage) : null;

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
            Titolo
          </label>
          <input
            id="title"
            name="title"
            defaultValue={post?.title}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-neutral-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={post?.slug}
            placeholder="festa-di-primavera-2026"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700">
          Estratto
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Contenuto</span>
        <div className="mt-1">
          <RichTextEditor name="content" defaultValue={post?.content ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="publishedAt" className="block text-sm font-medium text-neutral-700">
            Data pubblicazione
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={toDateInputValue(post?.publishedAt ?? null)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500">Vuoto = bozza, non visibile pubblicamente.</p>
        </div>
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-neutral-700">
            Visibilità
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={post?.visibility ?? "PUBLIC"}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="PUBLIC">Pubblico</option>
            <option value="PRIVATE">Privato (Fase 2)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={post?.featured ?? false}
          />
          In evidenza
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Mostra questo articolo nella sezione &quot;In evidenza&quot; della home page pubblica. Se più
          articoli sono segnati, viene mostrato il più recente tra questi.
        </p>
      </div>

      <div>
        <label htmlFor="externalLink" className="block text-sm font-medium text-neutral-700">
          Link esterno (es. galleria Google Photos)
        </label>
        <input
          id="externalLink"
          name="externalLink"
          type="url"
          defaultValue={post?.externalLink ?? ""}
          placeholder="https://photos.app.goo.gl/..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Categorie</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {categories.map((category) => (
            <label key={category.id} className="inline-flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                checked={selectedCategoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              {category.name}
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-neutral-500">
              Nessuna categoria ancora — creane una nella sezione Categorie.
            </p>
          )}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Immagine di copertina</span>
        <div className="mt-2 flex items-center gap-4">
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="Copertina" className="h-20 w-32 rounded-md object-cover" />
          )}
          <ImageUploader
            label={coverImage ? "Sostituisci copertina" : "Carica copertina"}
            onUploaded={(result) => setCoverImage(result.publicId)}
          />
        </div>
        <input type="hidden" name="coverImage" value={coverImage} />
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Galleria immagini</span>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.url + index} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.alt} className="aspect-square w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs text-red-600 shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ImageUploader label="Aggiungi immagine alla galleria" onUploaded={addGalleryImage} />
        </div>
        <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Crea articolo"}
      </button>

      {state.status === "success" && (
        <p className="text-sm font-medium text-green-700">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm font-medium text-red-600">{state.message}</p>
      )}
    </form>
  );
}
