import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventByIdForAdmin } from "@/lib/events";
import { EventForm } from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventByIdForAdmin(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/eventi" className="text-sm text-green-700 hover:underline">
        ← Torna a Eventi
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Modifica evento</h1>
      <EventForm event={event} />
    </div>
  );
}
