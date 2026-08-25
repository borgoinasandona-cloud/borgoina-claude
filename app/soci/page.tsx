import type { Metadata } from "next";
import { getPublicMembers } from "@/lib/users";
import { MemberCard } from "@/components/MemberCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iscritti",
};

export default async function SociPage() {
  const members = await getPublicMembers();

  return (
    <div>
      <div className="border-b border-ink/5 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-5xl wide:max-w-6xl">
          <p className="eyebrow text-brick wide:text-sm">Tra vicini</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl wide:text-6xl">
            Iscritti
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft wide:text-xl">
            Le persone iscritte alla community del Borgo INA.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 wide:max-w-6xl">
        {members.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">Nessun iscritto ancora.</p>
        )}
      </div>
    </div>
  );
}
