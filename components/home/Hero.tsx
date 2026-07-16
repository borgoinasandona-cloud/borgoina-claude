import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[420px] w-full">
        <Image
          src="/images/home/hero.jpg"
          alt="Veduta aerea del Borgo INA di San Donà di Piave"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-4">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="max-w-xl text-4xl font-semibold text-white drop-shadow">
            Comitato Borgo INA San Donà
          </h1>
          <p className="mt-3 max-w-lg text-white/90 drop-shadow">
            Il quartiere si racconta: notizie, iniziative e vita di comunità del Borgo INA.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/news"
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Vai alla Bacheca
            </Link>
            <Link
              href="/chi-siamo"
              className="rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
            >
              Chi siamo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
