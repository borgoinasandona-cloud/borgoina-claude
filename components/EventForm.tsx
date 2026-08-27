"use client";

import { useActionState } from "react";
import type { Event } from "@prisma/client";
import { createEventAction, updateEventAction, type EventFormState } from "@/app/admin/(dashboard)/eventi/actions";

const initialState: EventFormState = { status: "idle" };

// Getter locali (non .toISOString(), che è sempre UTC): l'input datetime-local va ripopolato con
// lo stesso orario "letto alla lettera" che ci ha messo dentro new Date(...) in actions.ts, non
// con la sua conversione UTC — altrimenti il valore mostrato in modifica non coinciderebbe più con
// quanto digitato in creazione. Vedi il commento in app/admin/(dashboard)/eventi/actions.ts.
function toDateTimeInputValue(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventForm({ event }: { event?: Event }) {
  const isEdit = Boolean(event);
  const action = isEdit ? updateEventAction.bind(null, event!.id) : createEventAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
            Titolo
          </label>
          <input
            id="title"
            name="title"
            defaultValue={event?.title}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-neutral-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={event?.slug}
            placeholder="cena-di-quartiere-2026"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-neutral-700">
            Data e ora
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(event?.date ?? null)}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxSeats" className="block text-sm font-medium text-neutral-700">
            Posti massimi
          </label>
          <input
            id="maxSeats"
            name="maxSeats"
            type="number"
            min={1}
            defaultValue={event?.maxSeats ?? ""}
            placeholder="Vuoto = nessun limite"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notesLabel" className="block text-sm font-medium text-neutral-700">
          Etichetta campo note
        </label>
        <input
          id="notesLabel"
          name="notesLabel"
          defaultValue={event?.notesLabel ?? ""}
          placeholder="Vuoto = 'Note per l'organizzatore (opzionale)'"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Es. &quot;Preferenze menù&quot;, se vuoi chiedere qualcosa di specifico a chi si prenota.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Crea evento"}
      </button>

      {state.status === "success" && (
        <p className="text-sm font-medium text-green-700">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm font-medium text-red-600">{state.message}</p>
      )}
    </form>
  );
}
