import Image from "next/image";
import Link from "next/link";

// Testo placeholder in attesa dei contenuti reali da Dario (vedi PLANNING.md).
export function Iniziative() {
  return (
    <section className="bg-cream-deep py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:grid-cols-2 sm:items-center md:gap-16">
        <div className="relative aspect-video w-full overflow-hidden rounded border border-ink/10 shadow-sm sm:order-2">
          <Image
            src="/images/home/iniziative.jpg"
            alt="Iniziative del Borgo"
            fill
            className="object-cover"
          />
        </div>
        <div className="sm:order-1">
          <p className="eyebrow text-sky-dark">Da segnare in agenda</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Iniziative
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Feste, eventi e attività organizzate dal comitato durante l&apos;anno per la vita del
            quartiere.
          </p>
          <Link
            href="/news"
            className="group mt-6 inline-flex items-center gap-1.5 text-base font-bold text-brick transition-colors duration-200 hover:text-brick-dark"
          >
            Scopri le prossime iniziative
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
