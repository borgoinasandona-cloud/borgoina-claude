"use client";

import { useActionState } from "react";
import { rsvpAction, type RsvpFormState } from "@/app/eventi/[slug]/actions";

const initialState: RsvpFormState = { status: "idle" };

const inputClass =
  "w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none";

export function EventRsvpForm({
  slug,
  notesLabel,
  existingRsvp,
}: {
  slug: string;
  notesLabel: string | null;
  existingRsvp: { guests: number; notes: string | null } | null;
}) {
  const action = rsvpAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  const isEditing = existingRsvp !== null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-ink">
          Accompagnatori
        </label>
        <input
          id="guests"
          name="guests"
          type="number"
          min={0}
          max={20}
          defaultValue={existingRsvp?.guests ?? 0}
          className={`${inputClass} mt-1`}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink">
          {notesLabel || "Note per l'organizzatore (opzionale)"}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={existingRsvp?.notes ?? ""}
          className={`${inputClass} mt-1`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brick px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Invio…" : isEditing ? "Aggiorna prenotazione" : "Prenotati"}
      </button>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
