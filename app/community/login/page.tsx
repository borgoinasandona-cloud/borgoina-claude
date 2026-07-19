import type { Metadata } from "next";
import Link from "next/link";
import { CommunityLoginForm } from "@/components/CommunityLoginForm";

export const metadata: Metadata = {
  title: "Accedi",
};

export default function CommunityLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">Accedi</h1>
      <CommunityLoginForm />
      <p className="mt-6 text-sm text-ink-soft">
        Non hai ancora un account?{" "}
        <Link href="/community/register" className="font-semibold text-brick hover:text-brick-dark">
          Registrati
        </Link>
      </p>
    </div>
  );
}
