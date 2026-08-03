import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUserQrCode } from "@/lib/qr";
import { AccountForm } from "@/components/AccountForm";
import { UserQrCode } from "@/components/UserQrCode";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il mio account",
};

export default async function CommunityAccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, password: true, image: true },
  });
  if (!user) {
    redirect("/community/login");
  }

  const hasPassword = Boolean(user.password);
  const qrCodeDataUrl = await generateUserQrCode(session.user.id);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-brick wide:text-sm">Community</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink">
        Il mio account
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        {hasPassword
          ? "Aggiorna i tuoi dati o cambia password. Per salvare qualsiasi modifica devi confermare con la password attuale."
          : "Aggiorna i tuoi dati. Ti sei registrato con Google, quindi non hai una password da confermare — puoi impostarne una qui per poter accedere anche con email e password."}
      </p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <p className="eyebrow text-brick">Il mio QR code</p>
        <div className="mt-3">
          <UserQrCode dataUrl={qrCodeDataUrl} />
        </div>
      </div>

      <AccountForm
        name={user.name ?? ""}
        email={user.email}
        image={user.image}
        hasPassword={hasPassword}
      />

      <form action={logoutAction} className="mt-8 border-t border-ink/10 pt-6">
        <button
          type="submit"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-brick-dark"
        >
          Esci dall&apos;account
        </button>
      </form>
    </div>
  );
}
