import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo/logo-orizz.png"
            alt={siteConfig.name}
            width={441}
            height={134}
            className="h-12 md:h-16 w-auto"
            priority
          />
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-neutral-700">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
