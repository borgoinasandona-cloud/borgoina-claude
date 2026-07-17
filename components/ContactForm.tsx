"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/contatti/actions";

const initialState: ContactFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Nome
        </label>
        <input id="name" name="name" type="text" required className={inputClass} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-brick-dark">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-brick-dark">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Messaggio
        </label>
        <textarea id="message" name="message" rows={5} required className={inputClass} />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-sm text-brick-dark">{state.fieldErrors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Invio in corso…" : "Invia messaggio"}
      </button>

      {state.status === "success" && (
        <p className="text-sm font-medium text-sage-dark">{state.message}</p>
      )}
      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
