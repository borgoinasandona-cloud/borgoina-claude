import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Crea account",
};

export default function CommunityRegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">Crea account</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Registrati per pubblicare oggetti e servizi nella bacheca della community e commentare
        gli annunci degli altri iscritti.
      </p>

      <div className="mt-5">
        <GoogleSignInButton />
      </div>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold tracking-wide text-ink-soft uppercase">
        <span className="h-px flex-1 bg-ink/10" />
        oppure
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <RegisterForm />
      <p className="mt-6 text-sm text-ink-soft">
        Hai già un account?{" "}
        <Link href="/community/login" className="font-semibold text-brick hover:text-brick-dark">
          Accedi
        </Link>
      </p>
    </div>
  );
}
