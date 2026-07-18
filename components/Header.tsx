"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site-config";
import { InstagramIcon } from "@/components/InstagramIcon";
import { HamburgerIcon, CloseIcon } from "@/components/MenuIcons";

// Pagine il cui hero è una foto a piena larghezza (non una fascia di colore piatto):
// solo lì l'header può stare trasparente sopra l'immagine finché non si scrolla.
// Nota: /il-borgo e /chi-siamo hanno questo hero solo quando il contenuto CMS ha la
// struttura attesa (vedi le rispettive app/*/page.tsx) — se in futuro vanno in fallback
// su StaticPageView, l'header si comporterebbe comunque come se ci fosse un hero foto
// per quell'istante iniziale.
const HERO_IMAGE_PATHS = new Set(["/", "/il-borgo", "/chi-siamo"]);

export function Header() {
  const pathname = usePathname();
  const hasImageHero = HERO_IMAGE_PATHS.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <nav className="hidden items-center gap-x-6 gap-y-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors wide:text-sm ${iconColor}`}
            >
              {link.label}
            </Link>
          ))}
          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={`transition-colors ${iconColor}`}
            >
              <InstagramIcon />
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={mobileOpen}
          className={`transition-colors md:hidden ${overlay ? "text-cream" : "text-ink"}`}
        >
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ink/10 bg-cream px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-brick"
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
        </nav>
      )}
    </header>
  );
}
