"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/community/forgot-password/actions";

const initialState: ForgotPasswordState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.status === "success") {
    return (
      <p className="mt-5 rounded border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-sage-dark">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Invio…" : "Invia link di reset"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
