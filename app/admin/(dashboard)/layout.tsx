import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages/il-borgo", label: "Il Borgo" },
  { href: "/admin/pages/chi-siamo", label: "Chi siamo" },
  { href: "/admin/pages/contatti", label: "Contatti" },
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
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-neutral-700">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-700">
              {link.label}
            </Link>
          ))}
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
