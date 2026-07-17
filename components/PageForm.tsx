"use client";

import { useActionState } from "react";
import { savePageAction, type PageFormState } from "@/app/admin/(dashboard)/pages/actions";
import type { StaticPageSlug } from "@/lib/pages";
import { RichTextEditor } from "@/components/RichTextEditor";

const initialState: PageFormState = { status: "idle" };

export function PageForm({
  slug,
  title,
  content,
}: {
  slug: StaticPageSlug;
  title: string;
  content: string;
}) {
  const action = savePageAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Titolo
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Contenuto</span>
        <div className="mt-1">
          <RichTextEditor name="content" defaultValue={content} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : "Salva"}
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
