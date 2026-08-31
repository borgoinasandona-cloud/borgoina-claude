import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faQrcode, faStore, faCamera, faTag, faUserGroup, faGear } from "@fortawesome/free-solid-svg-icons";

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

export default function ComeFunzionanoGliScontiPage() {
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
            Come funzionano i Token
          </h1>
          <p className="mx-auto max-w-3xl px-4 text-lg leading-relaxed text-cream/85 md:text-xl">
            Token e offerte per i soci del Borgo, senza carte fedeltà o app da scaricare.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 wide:max-w-4xl">
        <p className="text-lg leading-relaxed text-ink-soft wide:text-xl">
          Un modo semplice per le Botteghe del Borgo di premiare i soci della community con
          offerte dedicate — sconti, omaggi, promozioni speciali — senza carte fedeltà o app da
          scaricare: basta il QR personale, sempre a portata di tocco dall&apos;icona in alto
          nell&apos;header. Dietro le quinte, ogni offerta è un token digitale collegato alla
          bottega che la propone, con un titolo chiaro e, se serve, le condizioni per usarla.
        </p>

        <section className="mt-12">
          <p className="eyebrow text-sky-dark">Per chi è socio</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-ink">Mostra il tuo QR in bottega</h2>
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
          <p className="eyebrow text-sage-dark">Per chi ha una bottega</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-ink">Assegna le offerte ai tuoi clienti soci</h2>
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
