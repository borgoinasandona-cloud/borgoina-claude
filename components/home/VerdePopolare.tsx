import Image from "next/image";

// Testi placeholder in attesa dei contenuti reali da Dario (vedi PLANNING.md).
const blocks = [
  {
    image: "/images/home/orti.jpg",
    title: "Orti condivisi",
    text: "Spazi verdi curati dai residenti, dove il quartiere coltiva insieme.",
  },
  {
    image: "/images/home/campo.jpg",
    title: "Spazi comuni",
    text: "Il verde del Borgo come luogo di incontro e attività condivise.",
  },
  {
    image: "/images/home/vicinato.jpg",
    title: "Vita di vicinato",
    text: "Relazioni di quartiere che nascono e crescono negli spazi comuni.",
  },
];

export function VerdePopolare() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <p className="eyebrow text-sage-dark">Nel verde</p>
      <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        Verde popolare
      </h2>
      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {blocks.map((block) => (
          <div key={block.title} className="group">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-ink/10 shadow-sm">
              <Image
                src={block.image}
                alt={block.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-sage" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-ink transition-colors duration-200 group-hover:text-sage-dark">
              {block.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">{block.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
