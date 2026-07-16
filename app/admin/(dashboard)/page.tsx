import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [postCount, pageCount, categoryCount, messageCount] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.category.count(),
    prisma.contactMessage.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Articoli Bacheca" value={postCount} />
        <Stat label="Pagine" value={pageCount} />
        <Stat label="Categorie" value={categoryCount} />
        <Stat label="Messaggi contatto" value={messageCount} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 p-4">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
