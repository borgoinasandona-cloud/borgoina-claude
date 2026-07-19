import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Crea account",
};

export default function CommunityRegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">Crea account</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Registrati per pubblicare oggetti e segnalazioni nella bacheca della community e commentare
        gli annunci degli altri iscritti.
      </p>
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
