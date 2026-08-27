import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUserQrCode } from "@/lib/qr";
import { getShopByAuthorId } from "@/lib/shops";
import { AccountForm } from "@/components/AccountForm";
import { UserQrCode } from "@/components/UserQrCode";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il mio account",
};

export default async function CommunityAccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, password: true, image: true },
  });
  if (!user) {
    redirect("/community/login");
  }

  const hasPassword = Boolean(user.password);
  const qrCodeDataUrl = await generateUserQrCode(session.user.id);
  const shop = await getShopByAuthorId(session.user.id);

  return (
    <div className="bg-cream/20 min-h-screen">
      {/* Page Header */}
      <div className="border-b border-ink/5 bg-cream-deep px-4 py-12">
        <div className="mx-auto max-w-5xl wide:max-w-6xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-brick wide:text-sm">Il mio profilo</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
              Il mio account
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">
              {hasPassword
                ? "Aggiorna i tuoi dati o cambia password. Per salvare qualsiasi modifica devi confermare con la password attuale."
                : "Aggiorna i tuoi dati. Ti sei registrato con Google, quindi non hai una password da confermare — puoi impostarne una qui per poter accedere anche con email e password."}
            </p>
          </div>
          <div className="shrink-0">
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brick hover:text-brick hover:bg-cream-deep cursor-pointer"
              >
                Esci dall&apos;account
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="mx-auto max-w-5xl px-4 py-12 wide:max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Account (Form) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-ink/10 bg-white p-6 md:p-8 shadow-md">
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                Dati personali
              </h2>
              <p className="text-xs text-ink-soft uppercase tracking-wider font-mono mb-6">
                Modifica i dettagli del profilo
              </p>
              <AccountForm
                name={user.name ?? ""}
                email={user.email}
                image={user.image}
                hasPassword={hasPassword}
              />
            </div>
          </div>

          {/* Sidebar: Sections 2 & 3 */}
          <div className="space-y-8">
            
            {/* Section 2: QR Code */}
            <div className="rounded-xl border border-ink/10 bg-white p-6 md:p-8 shadow-md">
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                Tessera digitale
              </h2>
              <p className="text-xs text-ink-soft uppercase tracking-wider font-mono mb-6">
                Il mio QR code
              </p>
              <UserQrCode dataUrl={qrCodeDataUrl} />
            </div>

            {/* Section 3: Community Actions */}
            <div className="rounded-xl border border-ink/10 bg-white p-6 md:p-8 shadow-md">
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                Community
              </h2>
              <p className="text-xs text-ink-soft uppercase tracking-wider font-mono mb-6">
                Partecipa alle attività
              </p>
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase font-mono">
                    Mercatino dell&apos;usato
                  </span>
                  <p className="text-sm text-ink-soft leading-normal">
                    Hai oggetti da vendere, regalare o prestare? Aggiungi il tuo annuncio in bacheca.
                  </p>
                  <Link
                    href="/community/new"
                    className="mt-1 inline-flex items-center justify-center gap-1.5 rounded bg-sage px-5 py-2.5 text-center text-sm font-semibold text-cream shadow-md transition-colors hover:bg-sage-dark"
                  >
                    Crea un annuncio nel Mercatino
                    <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="!h-3 !w-3" />
                  </Link>
                </div>

                <div className="border-t border-ink/5 pt-6 flex flex-col gap-2">
                  <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase font-mono">
                    Botteghe del Borgo
                  </span>
                  <p className="text-sm text-ink-soft leading-normal">
                    {shop
                      ? "Aggiorna la scheda della tua attività commerciale, i contatti, la storia e le foto."
                      : "Possiedi un'attività commerciale o professionale nel Borgo? Crea la tua vetrina."}
                  </p>
                  <Link
                    href="/community/bottega"
                    className="mt-1 inline-flex items-center justify-center gap-1.5 rounded bg-brick px-5 py-2.5 text-center text-sm font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark"
                  >
                    {shop ? "Gestisci la tua bottega" : "Crea la tua bottega"}
                    <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="!h-3 !w-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
