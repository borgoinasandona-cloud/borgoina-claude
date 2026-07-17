import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative -mt-[76px] md:-mt-[88px] wide:-mt-[96px]">
      <div className="relative h-[480px] w-full md:h-[600px] wide:h-[680px]">
        <Image
          src="/images/home/hero.jpg"
          alt="Veduta aerea del Borgo INA di San Donà di Piave"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20" />
      </div>
      <div className="absolute inset-0 flex flex-col items-start justify-end px-4 pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-5xl wide:max-w-6xl">
          <p className="eyebrow text-cream/80 wide:text-sm">Comitato civico di quartiere</p>
          <h1 className="font-display mt-3 max-w-2xl text-5xl leading-[0.95] font-extrabold tracking-tight text-cream sm:text-6xl lg:text-7xl wide:max-w-3xl wide:text-8xl">
            Borgo INA
            <br />
            San Donà
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/85 sm:text-xl wide:max-w-2xl wide:text-2xl">
            Il quartiere si racconta: notizie, iniziative e vita di comunità del Borgo INA.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/news"
              className="rounded bg-brick px-6 py-3 text-base font-semibold text-cream shadow-md transition-colors hover:bg-brick-dark wide:px-7 wide:py-3.5 wide:text-lg"
            >
              Vai alla Bacheca
            </Link>
            <Link
              href="/chi-siamo"
              className="rounded border border-cream/40 px-6 py-3 text-base font-semibold text-cream transition-colors hover:bg-cream/10 wide:px-7 wide:py-3.5 wide:text-lg"
            >
              Chi siamo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
