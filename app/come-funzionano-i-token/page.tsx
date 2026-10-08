import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faQrcode, faStore, faCamera, faTag, faUserGroup, faGear } from "@fortawesome/free-solid-svg-icons";
import { getActiveTokensAcrossShops } from "@/lib/discounts";
import { DiscountBadge } from "@/components/DiscountBadge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Come funzionano i Token",
};

function StepCard({
  icon,
  title,
  children,
}: {
  icon: IconDefinition;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-ink/10 bg-white p-5 shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brick/10 text-brick">
        <FontAwesomeIcon icon={icon} className="!h-4 !w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
      </div>
    </div>
  );
}

export default async function ComeFunzionanoGliScontiPage() {
  const activeTokens = await getActiveTokensAcrossShops();

  return (
    <div>
      <div className="relative -mt-[76px] flex h-[360px] items-center justify-center overflow-hidden bg-ink px-4 pt-[76px] text-cream md:-mt-[88px] md:h-[460px] md:pt-[88px] wide:-mt-[96px] wide:pt-[96px]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/come-funzionano-gli-sconti/comefunziona.jpg"
            alt="Una mano mostra la tessera digitale con QR code del Borgo INA su uno smartphone"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/40" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl space-y-4 text-center wide:max-w-4xl">
          <p className="eyebrow text-brick-light wide:text-sm">Guida ai token</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight leading-[0.95] drop-shadow-md md:text-5xl wide:text-6xl">
            Sono arrivati gli INA Token
          </h1>
          <p className="mx-auto max-w-3xl px-4 text-lg leading-relaxed text-cream/85 md:text-xl">
            Token e offerte per i soci del Borgo: come funzionano.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 wide:max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
          <Image
            src="/images/come-funzionano-gli-sconti/borgoina-1token.png"
            alt="Moneta Token del Borgo INA San Donà"
            width={200}
            height={200}
            className="h-36 w-36 shrink-0 md:h-44 md:w-44"
          />
          <p className="text-lg leading-relaxed text-ink-soft wide:text-xl">
            Un modo semplice per le Botteghe del Borgo di premiare i soci della community con
            offerte dedicate — sconti, omaggi, promozioni speciali — senza carte fedeltà o app da
            scaricare: basta il QR personale, sempre a portata di tocco dall&apos;icona in alto
            nell&apos;header. Dietro le quinte, ogni offerta è un token digitale collegato alla
            bottega che la propone, con un titolo chiaro e, se serve, le condizioni per usarla.
          </p>
        </div>

        {activeTokens.length > 0 && (
          <div className="mt-12 rounded-xl border border-gold/30 bg-gold/15 p-5">
            <p className="eyebrow inline-flex items-center gap-1.5 text-gold-dark">
              <FontAwesomeIcon icon={faTag} className="!h-3.5 !w-3.5" aria-hidden="true" />
              Offerte attive ora
            </p>
            <ul className="mt-3 space-y-2">
              {activeTokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-start justify-between gap-3 rounded border border-gold/20 bg-white px-4 py-2.5"
                >
                  <span className="min-w-0">
                    <Link
                      href={`/botteghe/${token.shop.slug}`}
                      className="font-mono block text-xs font-semibold tracking-wide text-ink-soft uppercase hover:text-gold-dark"
                    >
                      {token.shop.name}
                    </Link>
                    <span className="block font-semibold text-ink">{token.title}</span>
                    {token.description && (
                      <span className="mt-0.5 block text-sm text-ink-soft">{token.description}</span>
                    )}
                  </span>
                  <DiscountBadge remaining={token.remaining} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="mt-12">
          <span className="font-mono inline-block rounded-sm bg-sky/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-sky uppercase">
            Per chi è socio
          </span>
          <h2 className="font-display mt-3 text-2xl font-bold text-ink">Mostra il tuo QR in bottega</h2>
          <div className="mt-6 space-y-4">
            <StepCard icon={faQrcode} title="1. Apri il tuo QR personale">
              Tocca l&apos;icona del QR in alto nell&apos;header (accanto al tuo nome): si apre un
              codice che identifica solo te. Non serve stamparlo: basta averlo a portata sullo
              schermo del telefono quando entri in una bottega che aderisce.
            </StepCard>
            <StepCard icon={faTag} title="2. Chiedi se c'è un'offerta attiva">
              Sul listino pubblico di{" "}
              <span className="font-semibold text-ink">Botteghe</span>{" "}
              le attività con un&apos;offerta disponibile hanno un&apos;etichetta ben visibile con
              il numero di token ancora disponibili — non tutte le botteghe ne hanno una attiva in
              ogni momento.
            </StepCard>
            <StepCard icon={faStore} title="3. Fatti scansionare il QR">
              Il gestore della bottega inquadra il tuo codice con il proprio telefono: se c&apos;è
              un&apos;offerta disponibile, te la assegna sul momento. Ogni offerta si riscatta una
              sola volta a testa — se l&apos;attività la ripete in futuro, sarà un nuovo token da
              riscattare di nuovo.
            </StepCard>
          </div>
        </section>

        <section className="mt-12">
          <span className="font-mono inline-block rounded-sm bg-sage/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-sage uppercase">
            Per chi ha una bottega
          </span>
          <h2 className="font-display mt-3 text-2xl font-bold text-ink">
            Assegna le offerte ai tuoi clienti soci
          </h2>
          <div className="mt-6 space-y-4">
            <StepCard icon={faUserGroup} title="1. Iscriviti e crea la tua pagina Bottega">
              Registrati alla community del Borgo INA e crea la pagina della tua attività da{" "}
              <span className="font-mono">La mia bottega</span>
              {" "}— è la stessa pagina che ti rende visibile nel listino pubblico.
            </StepCard>
            <StepCard icon={faGear} title="2. L'associazione crea l'offerta per te">
              In base all&apos;accordo preso con il comitato — uno sconto, un omaggio, una
              promozione speciale — l&apos;associazione crea per la tua bottega un token con un
              titolo chiaro e la quantità totale disponibile (es. &quot;Brioche gratis min 10€ di
              spesa, 10 token&quot;). Non devi configurare nulla tu.
            </StepCard>
            <StepCard icon={faCamera} title="3. Scansiona il QR del cliente">
              Quando un socio ti mostra il suo QR, tocca l&apos;icona della fotocamera in alto
              nell&apos;header (visibile solo a chi ha una bottega collegata al proprio account),
              inquadra il codice e scegli l&apos;offerta da assegnare. Fatto: il token è riscattato
              e il contatore dei token residui si aggiorna subito.
            </StepCard>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-ink/10 bg-cream-deep p-6">
          <h2 className="font-display text-lg font-bold text-ink">Un paio di cose da sapere</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>
              Ogni offerta si riscatta una sola volta a persona: un socio non può farsela
              assegnare due volte con lo stesso token. Se l&apos;attività vuole ripetere la stessa
              offerta, l&apos;associazione crea semplicemente un nuovo token.
            </li>
            <li>
              Il numero di token disponibili per ogni offerta è deciso dall&apos;associazione
              insieme a ogni singola bottega, in base all&apos;accordo preso — non è un valore
              fisso uguale per tutti.
            </li>
            <li>
              Quando i token di un&apos;offerta finiscono, semplicemente non compare più tra
              quelle proponibili al socio: l&apos;associazione può sempre creare una nuova offerta
              in accordo con la bottega.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
