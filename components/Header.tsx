import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 wide:max-w-6xl">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo/logo-orizz.png"
            alt={siteConfig.name}
            width={441}
            height={134}
            className="h-11 w-auto md:h-14 wide:h-16"
            priority
          />
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[0.8rem] font-semibold tracking-[0.08em] text-ink-soft uppercase transition-colors hover:text-brick wide:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
