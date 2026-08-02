import Link from "next/link";
import { initials } from "@/lib/initials";

type Member = {
  id: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  shop: { slug: string; name: string; visibility: string } | null;
};

export function MemberCard({ member }: { member: Member }) {
  const displayName = member.name ?? "Socio";
  const hasPublicShop = member.shop?.visibility === "PUBLIC";

  return (
    <div className="flex flex-col items-center gap-3 rounded border border-ink/10 bg-white p-6 text-center shadow-sm">
      {member.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.image} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/10 text-lg font-semibold text-ink-soft">
          {initials(displayName)}
        </div>
      )}
      <div>
        <p className="font-display text-lg font-bold text-ink">{displayName}</p>
        <p className="font-mono mt-1 text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
          Socio dal{" "}
          {new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(member.createdAt)}
        </p>
      </div>
      {hasPublicShop && (
        <Link
          href={`/botteghe/${member.shop!.slug}`}
          className="text-sm font-semibold text-brick hover:text-brick-dark"
        >
          Vedi la sua bottega →
        </Link>
      )}
    </div>
  );
}
