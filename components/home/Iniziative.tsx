import Image from "next/image";
import Link from "next/link";

// Testo placeholder in attesa dei contenuti reali da Dario (vedi PLANNING.md).
export function Iniziative() {
  return (
    <section className="bg-neutral-50 py-16 md:py-24 border-y border-neutral-200/50">
      <div className="mx-auto grid max-w-5xl gap-12 md:gap-16 px-4 sm:grid-cols-2 sm:items-center">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-sm border border-neutral-200/60 sm:order-2 group">
          <Image 
            src="/images/home/iniziative.jpg" 
            alt="Iniziative del Borgo" 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
        <div className="sm:order-1">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Iniziative</h2>
          <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
            Feste, eventi e attività organizzate dal comitato durante l&apos;anno per la vita del
            quartiere.
          </p>
          <Link 
            href="/news" 
            className="mt-6 inline-flex items-center gap-1 text-base font-bold text-green-700 hover:text-green-800 transition duration-200"
          >
            Scopri le prossime iniziative <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
