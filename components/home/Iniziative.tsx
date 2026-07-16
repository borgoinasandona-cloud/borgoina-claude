import Image from "next/image";
import Link from "next/link";

// Testo placeholder in attesa dei contenuti reali da Dario (vedi PLANNING.md).
export function Iniziative() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2 sm:items-center">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg sm:order-2">
          <Image src="/images/home/iniziative.jpg" alt="Iniziative del Borgo" fill className="object-cover" />
        </div>
        <div className="sm:order-1">
          <h2 className="text-2xl font-semibold text-neutral-900">Iniziative</h2>
          <p className="mt-3 text-neutral-600">
            Feste, eventi e attività organizzate dal comitato durante l&apos;anno per la vita del
            quartiere.
          </p>
          <Link href="/news" className="mt-4 inline-block text-sm font-medium text-green-700 hover:underline">
            Scopri le prossime iniziative →
          </Link>
        </div>
      </div>
    </section>
  );
}
