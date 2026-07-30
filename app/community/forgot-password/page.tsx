import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Password dimenticata",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
        Password dimenticata
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Inserisci l&apos;email del tuo account: ti mandiamo un link per scegliere una nuova password.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-sm text-ink-soft">
        <Link href="/community/login" className="font-semibold text-brick hover:text-brick-dark">
          Torna al login
        </Link>
      </p>
    </div>
  );
}
