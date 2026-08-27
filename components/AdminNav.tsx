"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem =
  | { href: string; label: string }
  | { group: string; items: { href: string; label: string }[] };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

export function AdminNav({ adminNav }: { adminNav: AdminNavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Chiude la tendina quando si naviga (mobile) — pattern "adjust state during render", stesso
  // già usato in components/Header.tsx per chiudere il menu mobile pubblico al cambio pagina.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname.startsWith(href);
  }

  function linkClass(href: string) {
    return isActive(href) ? "font-semibold text-green-700" : "text-neutral-700 hover:text-green-700";
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 sm:hidden"
      >
        Menu
        <ChevronIcon open={open} />
      </button>

      <nav
        className={`${
          open ? "mt-2 flex" : "hidden"
        } w-full flex-col gap-4 rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:mt-0 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {adminNav.map((item, index) =>
          "group" in item ? (
            <div
              key={item.group}
              className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1"
            >
              {index > 0 && <span className="hidden h-4 w-px bg-neutral-300 sm:block" aria-hidden />}
              <span className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                {item.group}
              </span>
              <div className="flex flex-col gap-2 pl-3 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1 sm:pl-0">
                {item.items.map((link) => (
                  <Link key={link.href} href={link.href} className={`text-sm transition-colors ${linkClass(link.href)}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div key={item.href} className="flex items-center gap-x-4">
              {index > 0 && <span className="hidden h-4 w-px bg-neutral-300 sm:block" aria-hidden />}
              <Link href={item.href} className={`text-sm transition-colors ${linkClass(item.href)}`}>
                {item.label}
              </Link>
            </div>
          ),
        )}
      </nav>
    </div>
  );
}
