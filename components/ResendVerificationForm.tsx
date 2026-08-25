"use client";

import { useActionState } from "react";
import {
  resendVerificationAction,
  type ResendVerificationState,
} from "@/app/community/verify-email/actions";

const initialState: ResendVerificationState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function ResendVerificationForm({ email }: { email?: string }) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initialState);

  if (state.status === "success") {
    return <p className="mt-3 text-sm font-medium text-sage-dark">{state.message}</p>;
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      {!email && (
        <div>
          <label htmlFor="resend-email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Email
          </label>
          <input id="resend-email" name="email" type="email" required className={inputClass} />
        </div>
      )}
      {email && <input type="hidden" name="email" value={email} />}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold text-brick hover:text-brick-dark disabled:opacity-60"
      >
        {pending ? "Invio…" : "Rinvia email di conferma"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
