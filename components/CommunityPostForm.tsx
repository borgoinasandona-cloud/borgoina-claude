"use client";

import { useActionState, useState } from "react";
import {
  createCommunityPostAction,
  type NewCommunityPostState,
} from "@/app/community/new/actions";
import { ImageUploader, type CloudinaryUploadResult } from "@/components/ImageUploader";
import { communityPostTypeLabels, OBJECT_TYPES } from "@/lib/community";

const initialState: NewCommunityPostState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

const ANNOUNCEMENT_TYPES = ["ISSUE", "ANNOUNCEMENT"];

export function CommunityPostForm() {
  const [state, formAction, pending] = useActionState(createCommunityPostAction, initialState);
  const [coverImage, setCoverImage] = useState<CloudinaryUploadResult | null>(null);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="type" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Tipo di annuncio
        </label>
        <select id="type" name="type" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Scegli…
          </option>
          <optgroup label="Oggetti">
            {OBJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {communityPostTypeLabels[type]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Segnalazioni ed eventi">
            {ANNOUNCEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {communityPostTypeLabels[type]}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div>
        <label htmlFor="title" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Titolo
        </label>
        <input id="title" name="title" type="text" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="content" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Descrizione
        </label>
        <textarea id="content" name="content" rows={6} required className={inputClass} />
      </div>

      <div>
        <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Immagine (facoltativa)
        </span>
        <div className="mt-1">
          <ImageUploader
            label={coverImage ? "Cambia immagine" : "Carica immagine"}
            labelClassName="inline-flex cursor-pointer items-center rounded border border-ink/15 bg-cream px-3 py-2 text-sm font-medium text-ink-soft hover:border-brick hover:text-brick"
            onUploaded={setCoverImage}
          />
        </div>
        <input type="hidden" name="coverImage" value={coverImage?.secureUrl ?? ""} />
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage.secureUrl}
            alt=""
            className="mt-3 h-32 w-32 rounded border border-ink/10 object-cover"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Pubblicazione…" : "Pubblica (in moderazione)"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
