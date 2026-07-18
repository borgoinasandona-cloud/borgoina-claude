import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

type AdminNavItem =
  | { href: string; label: string }
  | { group: string; items: { href: string; label: string }[] };

const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  {
    group: "Pagine",
    items: [
      { href: "/admin/pages/il-borgo", label: "Il Borgo" },
      { href: "/admin/pages/chi-siamo", label: "Chi siamo" },
      { href: "/admin/pages/contatti", label: "Contatti" },
    ],
  },
  { href: "/admin/posts", label: "Bacheca" },
  { href: "/admin/categories", label: "Categorie" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-neutral-700">
          {adminNav.map((item, index) =>
            "group" in item ? (
              <div key={item.group} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {index > 0 && <span className="hidden h-4 w-px bg-neutral-300 sm:block" aria-hidden />}
                <span className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                  {item.group}
                </span>
                {item.items.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-green-700">
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              <div key={item.href} className="flex items-center gap-x-4">
                {index > 0 && <span className="hidden h-4 w-px bg-neutral-300 sm:block" aria-hidden />}
                <Link href={item.href} className="hover:text-green-700">
                  {item.label}
                </Link>
              </div>
            ),
          )}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
            Esci ({session.user.email})
          </button>
        </form>
      </div>
      <div className="py-8">{children}</div>
    </div>
  );
}
