import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-12 text-base text-neutral-600">
        <Image
          src="/logo/logo-vert.png"
          alt={siteConfig.name}
          width={295}
          height={259}
          className="h-20 md:h-24 w-auto"
        />
        <p className="mt-6 font-semibold text-neutral-800 text-lg">Comitato {siteConfig.name}</p>
        <p className="mt-2">
          <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-green-700">
            {siteConfig.contactEmail}
          </a>
        </p>
        {siteConfig.instagramUrl && (
          <p className="mt-1">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-700"
            >
              Instagram
            </a>
          </p>
        )}
        <p className="mt-4">
          <Link href="/contatti" className="hover:text-green-700">
            Contatti
          </Link>
        </p>
        <p className="mt-6 text-xs text-neutral-400">
          © {year} Comitato {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
