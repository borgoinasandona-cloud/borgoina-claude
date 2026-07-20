import Image from "next/image";
import Link from "next/link";
import { navLinks, navLinkAccentClasses, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-cream/10 bg-ink text-cream/80">
      <div className="mx-auto max-w-5xl px-4 py-14 wide:max-w-6xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <Image
              src="/logo/logo-orizz-white.png"
              alt={siteConfig.name}
              width={441}
              height={134}
              className="h-12 w-auto md:h-14 wide:h-16"
            />
            <p className="eyebrow mt-5 text-cream/50">Comitato civico di quartiere</p>
          </div>
          <div className="space-y-3 text-sm wide:text-base">
            <p className="eyebrow text-brick-light">Menù</p>
            <div className="flex flex-col items-start gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.accent
                      ? `font-mono rounded-sm px-2.5 py-1 text-xs font-semibold tracking-[0.08em] uppercase transition-colors ${navLinkAccentClasses[link.accent]}`
                      : "transition-colors hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-3 text-sm sm:text-right wide:text-base">
            <p className="eyebrow text-brick-light">Contatti</p>
            <p>
              <a href={`mailto:${siteConfig.contactEmail}`} className="transition-colors hover:text-white">
                {siteConfig.contactEmail}
              </a>
            </p>
            <p>
              Via Luigi Cadorna 33
              <br />
              30027 San Donà di Piave (VE)
            </p>
            <div className="flex flex-col gap-1 sm:items-end">
              {siteConfig.instagramUrl && (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Instagram
                </a>
              )}
              <Link href="/contatti" className="transition-colors hover:text-white">
                Scrivici →
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-cream/15 pt-6 text-xs text-cream/50">
          © {year} Comitato {siteConfig.name} — associazione registrata, C.F. 93053660275, San Donà di
          Piave
        </p>
      </div>
    </footer>
  );
}
