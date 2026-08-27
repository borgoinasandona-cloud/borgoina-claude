import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

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
  {
    group: "Bacheca",
    items: [
      { href: "/admin/posts", label: "Articoli" },
      { href: "/admin/categories", label: "Categorie" },
    ],
  },
  {
    group: "Community",
    items: [
      { href: "/admin/community", label: "Mercatino" },
      { href: "/admin/botteghe", label: "Botteghe" },
      { href: "/admin/eventi", label: "Eventi" },
    ],
  },
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <AdminNav adminNav={adminNav} />
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
    </div>
  );
}
