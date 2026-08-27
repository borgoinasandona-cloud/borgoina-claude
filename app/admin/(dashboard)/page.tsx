import { prisma } from "@/lib/prisma";
import { getCloudinaryUsage, getNeonUsage, type ServiceUsage } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const since24h = new Date();
  since24h.setHours(since24h.getHours() - 24);

  const [userCount, newUsers24h, shopCount, newShops24h, pendingCommunityPosts, cloudinaryUsage, neonUsage] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since24h } } }),
      prisma.shop.count(),
      prisma.shop.count({ where: { createdAt: { gte: since24h } } }),
      prisma.communityPost.count({ where: { visibility: "PENDING" } }),
      getCloudinaryUsage(),
      getNeonUsage(),
    ]);

  const usageCards = [cloudinaryUsage, neonUsage].filter((u): u is ServiceUsage => u !== null);

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

      {usageCards.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Utilizzo piani gratuiti
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {usageCards.map((usage) => (
              <UsageCard key={usage.service} usage={usage} />
            ))}
          </div>
        </div>
      )}
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

function UsageCard({ usage }: { usage: ServiceUsage }) {
  return (
    <div className="rounded-md border border-neutral-200 p-4">
      <p className="flex items-center justify-between">
        <span className="font-medium text-neutral-900">{usage.service}</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
          {usage.planLabel}
        </span>
      </p>
      <div className="mt-3 space-y-3">
        {usage.metrics.map((metric) => (
          <UsageBar key={metric.label} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function UsageBar({ metric }: { metric: { label: string; percent: number; detail: string } }) {
  const clampedWidth = Math.min(100, Math.max(0, metric.percent));
  const barColor = metric.percent >= 90 ? "bg-red-500" : metric.percent >= 70 ? "bg-amber-500" : "bg-green-600";

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-neutral-700">{metric.label}</span>
        <span className="text-neutral-500">
          {metric.percent.toFixed(1)}% · {metric.detail}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${clampedWidth}%` }} />
      </div>
    </div>
  );
}
