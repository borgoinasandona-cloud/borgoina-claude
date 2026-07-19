"use client";

import { useActionState } from "react";
import { addCommentAction, type CommentFormState } from "@/app/community/[slug]/actions";

const initialState: CommentFormState = { status: "idle" };

export function CommentForm({ slug }: { slug: string }) {
  const action = addCommentAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <textarea
        name="content"
        rows={3}
        required
        placeholder="Scrivi un commento…"
        className="w-full rounded border border-ink/15 bg-cream px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brick px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {pending ? "Invio…" : "Commenta"}
      </button>
      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
      )}
    </form>
  );
}
