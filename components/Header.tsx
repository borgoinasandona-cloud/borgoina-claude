"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faCamera } from "@fortawesome/free-solid-svg-icons";
import { navLinks, navLinkAccentClasses, siteConfig } from "@/lib/site-config";
import { initials } from "@/lib/initials";
import { InstagramIcon } from "@/components/InstagramIcon";
import { HamburgerIcon, CloseIcon } from "@/components/MenuIcons";
import { UserQrCode } from "@/components/UserQrCode";
import { InstallAppButton } from "@/components/InstallAppButton";

// Pagine il cui hero è una foto a piena larghezza (non una fascia di colore piatto):
// solo lì l'header può stare trasparente sopra l'immagine finché non si scrolla.
// Nota: /il-borgo e /chi-siamo hanno questo hero solo quando il contenuto CMS ha la
// struttura attesa (vedi le rispettive app/*/page.tsx) — se in futuro vanno in fallback
// su StaticPageView, l'header si comporterebbe comunque come se ci fosse un hero foto
// per quell'istante iniziale.
const HERO_IMAGE_PATHS = new Set(["/", "/il-borgo", "/chi-siamo", "/come-funzionano-gli-sconti"]);

// Il portale del menu mobile richiede document.body, non disponibile durante il render
// server: useSyncExternalStore rileva il mount lato client senza ricorrere a un
// useEffect con un setState dentro (che React sconsiglia — vedi CLAUDE.md).
function subscribeNoop() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export function Header({
  session,
  qrCodeDataUrl,
  hasShop,
}: {
  session: Session | null;
  qrCodeDataUrl: string | null;
  hasShop: boolean;
}) {
  const pathname = usePathname();
  // L'header pubblico è condiviso da tutte le rotte, /admin incluso (nessun layout separato — vedi
  // CLAUDE.md): in versione compatta lì per lasciare più spazio verticale al pannello admin,
  // specialmente in mobile dove la sua altezza normale si somma a quella del menu admin sotto.
  const isAdmin = pathname.startsWith("/admin");
  const hasImageHero = HERO_IMAGE_PATHS.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  // Chiudi il menu mobile e la modale QR quando cambia pagina (pattern "adjust state during
  // render" di React, per evitare un useEffect con solo un setState dentro).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setQrModalOpen(false);
  }

  useEffect(() => {
    if (!hasImageHero) return;

    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasImageHero]);

  // Blocca lo scroll della pagina sotto mentre il menu mobile o la modale QR sono aperti.
  useEffect(() => {
    if (!mobileOpen && !qrModalOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, qrModalOpen]);

  // A menu mobile aperto l'header resta sempre in versione solida, anche sopra una hero foto.
  const overlay = hasImageHero && !scrolled && !mobileOpen;
  const iconColor = overlay ? "text-cream/90 hover:text-white" : "text-ink-soft hover:text-brick";

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        overlay ? "bg-transparent" : "border-b border-ink/5 bg-cream/95 backdrop-blur"
      }`}
    >
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 wide:max-w-6xl ${
          isAdmin ? "py-2" : "py-4"
        }`}
      >
        <Link href="/" className="shrink-0">
          <Image
            src={overlay ? "/logo/logo-orizz-white.png" : "/logo/logo-orizz.png"}
            alt={siteConfig.name}
            width={441}
            height={134}
            className={isAdmin ? "h-8 w-auto" : "h-11 w-auto md:h-14 wide:h-16"}
            priority
          />
        </Link>

        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              {hasShop && (
                <Link
                  href="/scan"
                  aria-label="Scansiona QR token"
                  className={`-m-2 flex items-center justify-center p-2 transition-colors ${iconColor}`}
                >
                  <FontAwesomeIcon icon={faCamera} className="!h-6 !w-6" aria-hidden="true" />
                </Link>
              )}
              {qrCodeDataUrl && (
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  aria-label="Mostra il mio QR code"
                  className={`-m-2 flex items-center justify-center p-2 transition-colors ${iconColor}`}
                >
                  <FontAwesomeIcon icon={faQrcode} className="!h-6 !w-6 wide:!h-6 wide:!w-6" aria-hidden="true" />
                </button>
              )}
              <Link
                href="/community/account"
                aria-label={session.user.name || "Account"}
                className={`flex items-center gap-2 font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors wide:text-sm ${iconColor}`}
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[0.65rem] font-bold text-ink">
                    {initials(session.user.name || "Account")}
                  </span>
                )}
                <span className="hidden sm:inline">{session.user.name || "Account"}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/community/login"
              className="font-mono rounded-full bg-brick px-4 py-1.5 text-[0.75rem] font-semibold tracking-[0.08em] text-cream uppercase shadow-sm transition-colors hover:bg-brick-dark wide:px-5 wide:py-2 wide:text-sm"
            >
              Accedi
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Chiudi il menu" : "Apri il menu"}
            aria-expanded={mobileOpen}
            className={`-m-2 flex items-center justify-center p-2 transition-colors ${overlay ? "text-cream" : "text-ink"}`}
          >
            {mobileOpen ? (
              <CloseIcon className="!h-6 !w-6 wide:!h-6 wide:!w-6" />
            ) : (
              <HamburgerIcon className="!h-6 !w-6 wide:!h-6 wide:!w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Portale su document.body: un ancestor con backdrop-blur (l'header stesso) creerebbe
          un containing block per gli elementi "fixed", confinandoli al riquadro dell'header
          invece che a tutto il viewport — per questo backdrop e pannello vivono fuori da <header>. */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop: attenua la pagina sotto, chiude il menu al click. Parte da sotto
                l'header (non inset-0) così non deve mai competere con lui per lo stacking:
                una volta portato su document.body, l'header (nidificato in un wrapper non
                posizionato) e questi elementi "fixed" appartengono a livelli di stacking
                diversi e uno z-index più alto sull'header non basterebbe a tenerlo sopra. */}
            <div
              className={`fixed inset-x-0 top-[76px] bottom-0 z-20 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 md:top-[88px] wide:top-[96px] ${
                mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Pannello del menu: modale che scende dall'header con un piccolo fade + slide.
                L'offset dall'alto segue l'altezza dell'header, che cresce con il logo ai
                breakpoint più larghi (vedi le classi h-11/md:h-14/wide:h-16 sul logo). */}
            <nav
              className={`fixed inset-x-0 top-[76px] z-30 border-t border-ink/5 bg-cream shadow-xl transition-all duration-300 ease-out md:top-[88px] wide:top-[96px] ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-3 opacity-0"
              }`}
              inert={!mobileOpen}
            >
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-8 px-4 py-10 md:gap-x-16 md:py-14 wide:max-w-6xl wide:gap-x-24">
                {/* Colonna 1: Home + pagine del sito. "Home" resta fuori da navLinks (usato
                    anche dal Footer, dove non serve — vedi CLAUDE.md) e viene aggiunta solo qui.
                    Etichette di gruppo (eyebrow) come nel resto del sito: qui incapsulano una
                    distinzione reale — pagine statiche vs. spazi da usare/partecipare — non sono
                    decorative. */}
                <div className="flex flex-col items-start gap-5">
                  <p className="eyebrow text-brick-light">Pagine</p>
                  <div className="flex flex-col items-start gap-3 md:gap-4">
                    <Link
                      href="/"
                      className="font-display rounded-sm text-2xl font-extrabold tracking-tight text-ink transition-all duration-200 hover:translate-x-1 hover:text-brick focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick md:text-3xl wide:text-4xl"
                    >
                      Home
                    </Link>
                    {navLinks
                      .filter((link) => !link.accent)
                      .map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="font-display rounded-sm text-2xl font-extrabold tracking-tight text-ink transition-all duration-200 hover:translate-x-1 hover:text-brick focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick md:text-3xl wide:text-4xl"
                        >
                          {link.label}
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Colonna 2: spazi da usare (fondino colorato) + un gruppo separato "Social".
                    Il filo verticale color cielo richiama le linee di malta chiara tra i mattoni
                    del logo/palette (vedi il commento in globals.css) — la stessa idea del bordo
                    dei blockquote in .prose-content, non un divisore generico. */}
                <div className="flex flex-col items-start gap-6 border-l-2 border-sky/25 pl-6 md:pl-10">
                  <div className="flex flex-col items-start gap-5">
                    <p className="eyebrow text-sky-dark">Partecipa</p>
                    <div className="flex flex-col items-start gap-3 md:gap-4">
                      {navLinks
                        .filter((link) => link.accent)
                        .map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`font-mono rounded-sm px-4 py-2 text-sm font-semibold tracking-[0.08em] uppercase transition-all duration-200 hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick md:text-base ${navLinkAccentClasses[link.accent!]}`}
                          >
                            {link.label}
                          </Link>
                        ))}
                    </div>
                  </div>

                  {siteConfig.instagramUrl && (
                    <div className="flex flex-col items-start gap-5">
                      <p className="eyebrow text-sky-dark">Social</p>
                      <a
                        href={siteConfig.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-sm font-mono text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase transition-all duration-200 hover:translate-x-1 hover:text-brick focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brick md:text-base"
                      >
                        <InstagramIcon />
                        Instagram
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottone "Installa l'app": solo nel layout mobile (sm:hidden), in fondo al menu
                    (col-span-2 per occupare tutta la larghezza sotto le due colonne) — su schermi
                    più larghi installare il sito come app ha meno senso. Il componente ritorna
                    null sull'intero wrapper (non solo sul bottone) quando non c'è nulla da
                    mostrare (già installata / non installabile qui), altrimenti il bordo/margine
                    passato come wrapperClassName resterebbe visibile come divisore "orfano" nel
                    menu — vedi components/InstallAppButton.tsx. */}
                <InstallAppButton wrapperClassName="col-span-2 mt-8 border-t border-ink/5 pt-6 sm:hidden" />
              </div>
            </nav>

            {/* Modale QR: stesso pattern di backdrop+contenuto del menu mobile, ma centrata
                e indipendente da esso (i due non si aprono mai insieme, il click sull'icona QR
                non passa dal bottone hamburger). */}
            {qrCodeDataUrl && (
              <div
                className={`fixed inset-0 z-40 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4 transition-opacity duration-300 ${
                  qrModalOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={() => setQrModalOpen(false)}
                inert={!qrModalOpen}
              >
                <div
                  className={`relative rounded-xl bg-white p-6 shadow-xl transition-transform duration-300 ${
                    qrModalOpen ? "scale-100" : "scale-95"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(false)}
                    aria-label="Chiudi"
                    className="absolute top-3 right-3 text-ink-soft transition-colors hover:text-brick"
                  >
                    <CloseIcon className="!h-5 !w-5" />
                  </button>
                  <UserQrCode dataUrl={qrCodeDataUrl} />
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </header>
  );
}
