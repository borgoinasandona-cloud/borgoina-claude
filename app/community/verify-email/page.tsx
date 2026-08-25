import type { Metadata } from "next";
import Link from "next/link";
import { consumeEmailVerificationToken } from "@/lib/tokens";
import { ResendVerificationForm } from "@/components/ResendVerificationForm";

export const metadata: Metadata = {
  title: "Verifica email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await consumeEmailVerificationToken(token) : null;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>

      {email ? (
        <>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
            Email verificata
          </h1>
          <div className="mt-6 rounded border border-ink/20 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-ink-soft">
              Il tuo account è attivo. Ora puoi accedere.
            </p>
            <Link
              href="/community/login"
              className="mt-5 inline-block rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
            >
              Vai al login
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
            Link non valido
          </h1>
          <div className="mt-6 rounded border border-ink/20 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-ink-soft">
              Questo link di conferma non è valido o è scaduto (i link durano 24 ore). Puoi
              richiederne uno nuovo.
            </p>
            <ResendVerificationForm />
          </div>
        </>
      )}
    </div>
  );
}
