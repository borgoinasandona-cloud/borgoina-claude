"use client";

import { useActionState } from "react";
import { createTokenAction, type TokenFormState } from "@/app/admin/(dashboard)/botteghe/[id]/tokens/actions";

const initialState: TokenFormState = { status: "idle" };

export function TokenForm({ shopId }: { shopId: string }) {
  const [state, formAction, pending] = useActionState(createTokenAction.bind(null, shopId), initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-wrap items-end gap-4 border-t border-neutral-200 pt-6">
      <div>
        <label htmlFor="discountPct" className="block text-xs font-medium text-neutral-500">
          Percentuale sconto
        </label>
        <input
          id="discountPct"
          name="discountPct"
          type="number"
          min={1}
          max={100}
          required
          className="mt-1 w-28 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
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
        className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Creazione…" : "+ Nuovo token"}
      </button>
      {state.status === "error" && state.message && (
        <p className="w-full text-sm font-medium text-red-700">{state.message}</p>
      )}
    </form>
  );
}
