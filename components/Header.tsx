"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site-config";
import { InstagramIcon } from "@/components/InstagramIcon";

// Pagine il cui hero è una foto a piena larghezza (non una fascia di colore piatto):
// solo lì l'header può stare trasparente sopra l'immagine finché non si scrolla.
// Nota: /il-borgo ha questo hero solo quando il contenuto CMS ha la struttura attesa
// (vedi app/il-borgo/page.tsx) — se in futuro va in fallback su StaticPageView, l'header
// si comporterebbe comunque come se ci fosse un hero foto per quell'istante iniziale.
const HERO_IMAGE_PATHS = new Set(["/", "/il-borgo"]);

export function Header() {
  const pathname = usePathname();
  const hasImageHero = HERO_IMAGE_PATHS.has(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasImageHero) return;

    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasImageHero]);

  const overlay = hasImageHero && !scrolled;

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
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors wide:text-sm ${
                overlay ? "text-cream/90 hover:text-white" : "text-ink-soft hover:text-brick"
              }`}
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
              className={`transition-colors ${
                overlay ? "text-cream/90 hover:text-white" : "text-ink-soft hover:text-brick"
              }`}
            >
              <InstagramIcon />
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
