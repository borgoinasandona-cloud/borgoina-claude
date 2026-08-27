import Link from "next/link";
import { EventForm } from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default function AdminNewEventPage() {
  return (
    <div>
      <Link href="/admin/eventi" className="text-sm text-green-700 hover:underline">
        ← Torna a Eventi
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Nuovo evento</h1>
      <EventForm />
    </div>
  );
}
