import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const since24h = new Date();
  since24h.setHours(since24h.getHours() - 24);

  const [userCount, newUsers24h, shopCount, newShops24h, pendingCommunityPosts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.shop.count(),
    prisma.shop.count({ where: { createdAt: { gte: since24h } } }),
    prisma.communityPost.count({ where: { visibility: "PENDING" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Utenti" value={userCount} />
        <Stat label="Nuovi utenti (24h)" value={newUsers24h} />
        <Stat label="Botteghe" value={shopCount} />
        <Stat label="Nuove botteghe (24h)" value={newShops24h} />
        <Stat label="Annunci in approvazione" value={pendingCommunityPosts} />
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
