"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/app/admin/(dashboard)/categories/actions";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Eventi"
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-neutral-700">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          placeholder="eventi"
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Aggiunta…" : "Aggiungi categoria"}
      </button>
      {state.status === "error" && (
        <p className="w-full text-sm font-medium text-red-600">{state.message}</p>
      )}
    </form>
  );
}
