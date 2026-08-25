"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateAccountAction, type UpdateAccountState } from "@/app/community/account/actions";
import { ImageUploader } from "@/components/ImageUploader";
import { initials } from "@/lib/initials";

const initialState: UpdateAccountState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function AccountForm({
  name,
  email,
  image,
  hasPassword,
}: {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateAccountAction, initialState);
  const [avatar, setAvatar] = useState(image ?? "");

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Foto profilo
        </label>
        <div className="mt-2 flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/10 text-sm font-semibold text-ink-soft">
              {initials(name)}
            </div>
          )}
          <div className="flex flex-col items-start gap-1">
            <ImageUploader
              label={avatar ? "Cambia foto" : "Carica foto"}
              labelClassName="cursor-pointer text-sm font-semibold text-brick hover:text-brick-dark"
              onUploaded={(result) => setAvatar(result.secureUrl)}
            />
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="text-sm text-ink-soft hover:text-brick-dark"
              >
                Rimuovi foto
              </button>
            )}
          </div>
        </div>
        <input type="hidden" name="image" value={avatar} />
      </div>

      <div>
        <label htmlFor="name" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Nome
        </label>
        <input id="name" name="name" type="text" required defaultValue={name} className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Email
        </label>
        <input id="email" name="email" type="email" required defaultValue={email} className={inputClass} />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
        >
          {hasPassword ? "Nuova password (lascia vuoto per non cambiarla)" : "Imposta una password (facoltativo)"}
        </label>
        <input id="newPassword" name="newPassword" type="password" minLength={8} className={inputClass} />
      </div>

      {hasPassword && (
        <div className="border-t border-ink/20 pt-4">
          <label
            htmlFor="currentPassword"
            className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
          >
            Password attuale (per confermare le modifiche)
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className={inputClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : "Salva modifiche"}
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
