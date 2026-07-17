import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[480px] md:h-[580px] w-full">
        <Image
          src="/images/home/hero.jpg"
          alt="Veduta aerea del Borgo INA di San Donà di Piave"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-4">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight">
            Comitato Borgo INA San Donà
          </h1>
          <p className="mt-4 max-w-xl text-lg sm:text-xl text-neutral-100/90 drop-shadow-sm leading-relaxed">
            Il quartiere si racconta: notizie, iniziative e vita di comunità del Borgo INA.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/news"
              className="rounded-lg bg-green-700 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-green-800 transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Vai alla Bacheca
            </Link>
            <Link
              href="/chi-siamo"
              className="rounded-lg bg-white/90 px-6 py-3 text-base font-semibold text-neutral-900 shadow-md hover:bg-white transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Chi siamo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
