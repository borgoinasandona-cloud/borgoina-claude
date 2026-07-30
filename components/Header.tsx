"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { navLinks, navLinkAccentClasses, siteConfig } from "@/lib/site-config";
import { InstagramIcon } from "@/components/InstagramIcon";
import { HamburgerIcon, CloseIcon } from "@/components/MenuIcons";

// Pagine il cui hero è una foto a piena larghezza (non una fascia di colore piatto):
// solo lì l'header può stare trasparente sopra l'immagine finché non si scrolla.
// Nota: /il-borgo e /chi-siamo hanno questo hero solo quando il contenuto CMS ha la
// struttura attesa (vedi le rispettive app/*/page.tsx) — se in futuro vanno in fallback
// su StaticPageView, l'header si comporterebbe comunque come se ci fosse un hero foto
// per quell'istante iniziale.
const HERO_IMAGE_PATHS = new Set(["/", "/il-borgo", "/chi-siamo"]);

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

export function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const hasImageHero = HERO_IMAGE_PATHS.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  // Chiudi il menu mobile quando cambia pagina (pattern "adjust state during render"
  // di React, per evitare un useEffect con solo un setState dentro).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
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

  // Blocca lo scroll della pagina sotto mentre il menu mobile (modale) è aperto.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // A menu mobile aperto l'header resta sempre in versione solida, anche sopra una hero foto.
  const overlay = hasImageHero && !scrolled && !mobileOpen;
  const iconColor = overlay ? "text-cream/90 hover:text-white" : "text-ink-soft hover:text-brick";

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        overlay ? "bg-transparent" : "border-b border-ink/10 bg-cream/95 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 wide:max-w-6xl">
        <Link href="/" className="shrink-0">
          <Image
            src={overlay ? "/logo/logo-orizz-white.png" : "/logo/logo-orizz.png"}
            alt={siteConfig.name}
            width={441}
            height={134}
            className="h-11 w-auto md:h-14 wide:h-16"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/community/account"
              className={`flex items-center gap-2 font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors wide:text-sm ${iconColor}`}
            >
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              {session.user.name || "Account"}
            </Link>
          ) : (
            <Link
              href="/community/login"
              className={`font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors wide:text-sm ${iconColor}`}
            >
              Accedi
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Chiudi il menu" : "Apri il menu"}
            aria-expanded={mobileOpen}
            className={`transition-colors ${overlay ? "text-cream" : "text-ink"}`}
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
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
              className={`fixed inset-x-0 top-[76px] z-30 border-t border-ink/10 bg-cream px-4 py-6 shadow-xl transition-all duration-300 ease-out md:top-[88px] wide:top-[96px] ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-3 opacity-0"
              }`}
              inert={!mobileOpen}
            >
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 wide:max-w-6xl">
                {/* Colonna 1: Home + pagine del sito. "Home" resta fuori da navLinks (usato
                    anche dal Footer, dove non serve — vedi CLAUDE.md) e viene aggiunta solo qui. */}
                <div className="flex flex-col items-start gap-4">
                  <Link
                    href="/"
                    className="font-mono text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-brick"
                  >
                    Home
                  </Link>
                  {navLinks
                    .filter((link) => !link.accent)
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="font-mono text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-brick"
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>

                {/* Colonna 2: servizi (fondino colorato) + Instagram. */}
                <div className="flex flex-col items-start gap-4">
                  {navLinks
                    .filter((link) => link.accent)
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`font-mono rounded-sm px-3 py-1.5 text-sm font-semibold tracking-[0.08em] uppercase transition-colors ${navLinkAccentClasses[link.accent!]}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  {siteConfig.instagramUrl && (
                    <a
                      href={siteConfig.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-brick"
                    >
                      <InstagramIcon />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </nav>
          </>,
          document.body,
        )}
    </header>
  );
}
