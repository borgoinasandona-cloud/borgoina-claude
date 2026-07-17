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
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Verde popolare</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {blocks.map((block) => (
          <div key={block.title} className="group">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm border border-neutral-100/80">
              <Image 
                src={block.image} 
                alt={block.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            <h3 className="mt-4 text-xl font-bold text-neutral-900 group-hover:text-green-700 transition-colors duration-200">
              {block.title}
            </h3>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed">{block.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
