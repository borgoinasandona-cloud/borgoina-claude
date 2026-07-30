import type { Metadata } from "next";
import Link from "next/link";
import { peekPasswordResetToken } from "@/lib/tokens";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reimposta password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await peekPasswordResetToken(token) : null;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>

      {valid && token ? (
        <>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
            Scegli una nuova password
          </h1>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
            Link non valido
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Questo link di reset non è valido o è scaduto (i link durano 1 ora). Puoi richiederne
            uno nuovo.
          </p>
          <Link
            href="/community/forgot-password"
            className="mt-5 inline-block rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
          >
            Richiedi un nuovo link
          </Link>
        </>
      )}
    </div>
  );
}
