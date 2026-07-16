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
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-2xl font-semibold text-neutral-900">Verde popolare</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {blocks.map((block) => (
          <div key={block.title}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <Image src={block.image} alt={block.title} fill className="object-cover" />
            </div>
            <h3 className="mt-3 font-semibold text-neutral-900">{block.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{block.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
