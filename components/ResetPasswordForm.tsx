"use client";

import { useActionState, useState, type FormEvent } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/community/reset-password/actions";

const initialState: ResetPasswordState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    if (password !== confirmPassword) {
      event.preventDefault();
      setConfirmError("Le password non coincidono.");
      return;
    }
    setConfirmError(null);
  }

  if (state.status === "success") {
    return (
      <p className="mt-5 rounded border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-sage-dark">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-5 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Nuova password
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

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
        >
          Conferma password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
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
        {pending ? "Salvataggio…" : "Reimposta password"}
      </button>

      {confirmError && <p className="text-sm font-medium text-brick-dark">{confirmError}</p>}
      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
