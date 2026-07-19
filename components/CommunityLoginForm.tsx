"use client";

import { useActionState } from "react";
import { communityLoginAction, type CommunityLoginState } from "@/app/community/login/actions";

const initialState: CommunityLoginState = {};

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function CommunityLoginForm() {
  const [state, formAction, pending] = useActionState(communityLoginAction, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-4">
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
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>

      {state.error && <p className="text-sm font-medium text-brick-dark">{state.error}</p>}
    </form>
  );
}
