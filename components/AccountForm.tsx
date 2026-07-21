"use client";

import { useActionState } from "react";
import { updateAccountAction, type UpdateAccountState } from "@/app/community/account/actions";

const initialState: UpdateAccountState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function AccountForm({
  name,
  email,
  hasPassword,
}: {
  name: string;
  email: string;
  hasPassword: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateAccountAction, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-4">
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
        <div className="border-t border-ink/10 pt-4">
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
