import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-cream/10 bg-ink text-cream/80">
      <div className="mx-auto max-w-5xl px-4 py-14 wide:max-w-6xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <Image
              src="/logo/logo-vert-white.png"
              alt={siteConfig.name}
              width={295}
              height={259}
              className="h-20 w-auto md:h-24 wide:h-28"
            />
            <p className="eyebrow mt-5 text-cream/50">Comitato civico di quartiere</p>
          </div>
          <div className="space-y-3 text-sm sm:text-right wide:text-base">
            <p className="eyebrow text-brick-light">Contatti</p>
            <p>
              <a href={`mailto:${siteConfig.contactEmail}`} className="transition-colors hover:text-white">
                {siteConfig.contactEmail}
              </a>
            </p>
            <p>Via Luigi Cadorna 33, 30027 San Donà di Piave (VE)</p>
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
          © {year} Comitato {siteConfig.name} — associazione registrata, San Donà di Piave
        </p>
      </div>
    </footer>
  );
}
