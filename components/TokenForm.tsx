"use client";

import { useActionState } from "react";
import { createTokenAction, type TokenFormState } from "@/app/admin/(dashboard)/botteghe/[id]/tokens/actions";

const initialState: TokenFormState = { status: "idle" };

export function TokenForm({ shopId }: { shopId: string }) {
  const [state, formAction, pending] = useActionState(createTokenAction.bind(null, shopId), initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-wrap items-stretch gap-4 border-t border-neutral-200 pt-6">
      <div className="flex min-w-[16rem] flex-1 flex-col justify-end">
        <label htmlFor="title" className="block text-xs font-medium text-neutral-500">
          Titolo offerta
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder='Es. "Brioche gratis min 10€"'
          required
          className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex min-w-[16rem] flex-1 flex-col justify-end">
        <label htmlFor="description" className="block text-xs font-medium text-neutral-500">
          Dettagli/condizioni (opzionale)
        </label>
        <textarea
          id="description"
          name="description"
          rows={1}
          placeholder="Es. valido solo nel weekend"
          className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col justify-end">
        <label htmlFor="totalIssued" className="block text-xs font-medium text-neutral-500">
          Quantità
        </label>
        <input
          id="totalIssued"
          name="totalIssued"
          type="number"
          min={1}
          required
          className="mt-1 w-28 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Creazione…" : "+ Nuovo token"}
      </button>
      {state.status === "error" && state.message && (
        <p className="w-full text-sm font-medium text-red-700">{state.message}</p>
      )}
    </form>
  );
}
