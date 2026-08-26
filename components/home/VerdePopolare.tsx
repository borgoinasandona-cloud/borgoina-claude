import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Testi placeholder in attesa dei contenuti reali da Dario (vedi PLANNING.md).
const blocks = [
  {
    image: "/images/home/orti.jpg",
    title: "Orti condivisi",
    text: "Spazi verdi curati dai residenti, dove il quartiere coltiva insieme ortaggi, fiori e relazioni di vicinato.",
  },
  {
    image: "/images/home/campo.jpg",
    title: "Spazi comuni",
    text: "Il verde del Borgo come luogo di incontro: prato, panchine e alberi dove nascono le occasioni di stare insieme.",
  },
];

export function VerdePopolare() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24 wide:max-w-6xl">
      <p className="eyebrow text-sage-dark wide:text-sm">Nel verde</p>
      <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl wide:text-5xl">
        Verde popolare
      </h2>
      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {blocks.map((block) => (
          <div
            key={block.title}
            className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image src={block.image} alt={block.title} fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-sage" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-ink wide:text-2xl">{block.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft wide:text-lg">{block.text}</p>
            </div>
          </div>
        ))}

        <Link
          href="/come-funzionano-gli-sconti"
          className="group overflow-hidden rounded-xl border border-ink/10 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/come-funzionano-gli-sconti/comefunziona.jpg"
              alt="Token sconto nel Borgo"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-brick" />
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-ink transition-colors duration-200 group-hover:text-brick wide:text-2xl">
              Token sconto nel Borgo
            </h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft wide:text-lg">
              Le Botteghe del Borgo offrono sconti ai soci: scopri come funziona con il tuo QR
              personale.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brick transition-colors duration-200 group-hover:text-brick-dark">
              Scopri come funziona
              <FontAwesomeIcon
                icon={faArrowRight}
                aria-hidden="true"
                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1"
              />
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
