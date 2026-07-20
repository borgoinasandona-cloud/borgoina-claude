import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CommunityPostForm } from "@/components/CommunityPostForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuovo annuncio",
};

export default async function NewCommunityPostPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/community/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        Nuovo annuncio
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Regala, vendi o presta un oggetto, oppure offriti o chiedi una mano per un servizio o un
        lavoretto. Prima di comparire pubblicamente, ogni annuncio viene controllato da un
        amministratore.
      </p>
      <CommunityPostForm />
    </div>
  );
}
