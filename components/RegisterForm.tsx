"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/app/community/register/actions";

const initialState: RegisterState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Nome
        </label>
        <input id="name" name="name" type="text" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Creazione account…" : "Crea account"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
