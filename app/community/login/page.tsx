import type { Metadata } from "next";
import Link from "next/link";
import { CommunityLoginForm } from "@/components/CommunityLoginForm";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Accedi",
};

export default async function CommunityLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">Accedi</h1>

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6 shadow-md md:p-8">
        <GoogleSignInButton callbackUrl={callbackUrl} />
        <div className="my-5 flex items-center gap-3 text-xs font-semibold tracking-wide text-ink-soft uppercase">
          <span className="h-px flex-1 bg-ink/10" />
          oppure
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <CommunityLoginForm callbackUrl={callbackUrl} />
        <p className="mt-4 text-sm text-ink-soft">
          <Link href="/community/forgot-password" className="font-semibold text-brick hover:text-brick-dark">
            Password dimenticata?
          </Link>
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          Non hai ancora un account?{" "}
          <Link href="/community/register" className="font-semibold text-brick hover:text-brick-dark">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
