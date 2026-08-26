import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faQrcode, faStore, faCamera, faTag, faUserGroup, faGear } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "Come funzionano gli sconti",
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
        <FontAwesomeIcon icon={icon} className="h-4 w-4" aria-hidden="true" />
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
      <div className="border-b border-ink/5 bg-cream-deep px-4 py-16">
        <div className="mx-auto max-w-3xl wide:max-w-4xl">
          <p className="eyebrow text-brick wide:text-sm">Guida</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-ink leading-tight md:text-5xl">
            Come funzionano gli sconti
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft wide:text-xl">
            Un modo semplice per le Botteghe del Borgo di offrire uno sconto ai soci della
            community, senza carte fedeltà o app da scaricare: basta il QR personale già presente
            nell&apos;account di ogni iscritto.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 wide:max-w-4xl">
        <section>
          <p className="eyebrow text-sky-dark">Per chi è socio</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-ink">Mostra il tuo QR in bottega</h2>
          <div className="mt-6 space-y-4">
            <StepCard icon={faQrcode} title="1. Apri il tuo QR personale">
              In <span className="font-mono">Il mio account</span> → <span className="font-mono">Tessera digitale</span> trovi
              un codice QR che identifica solo te. Non serve stamparlo: basta averlo a portata sullo
              schermo del telefono quando entri in una bottega che aderisce.
            </StepCard>
            <StepCard icon={faTag} title="2. Chiedi se c'è uno sconto attivo">
              Sul listino pubblico di{" "}
              <span className="font-semibold text-ink">Botteghe</span>{" "}
              le attività con uno sconto disponibile hanno un&apos;etichetta ben visibile con il
              numero di sconti ancora disponibili — non tutte le botteghe ne hanno uno attivo in
              ogni momento.
            </StepCard>
            <StepCard icon={faStore} title="3. Fatti scansionare il QR">
              Il gestore della bottega inquadra il tuo codice con il proprio telefono: se c&apos;è
              uno sconto disponibile, te lo applica sul momento. Puoi farlo ogni volta che torni,
              finché ci sono ancora posti disponibili per quello sconto.
            </StepCard>
          </div>
        </section>

        <section className="mt-12">
          <p className="eyebrow text-sage-dark">Per chi ha una bottega</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-ink">Assegna lo sconto ai tuoi clienti soci</h2>
          <div className="mt-6 space-y-4">
            <StepCard icon={faUserGroup} title="1. Iscriviti e crea la tua pagina Bottega">
              Registrati alla community del Borgo INA e crea la pagina della tua attività da{" "}
              <span className="font-mono">La mia bottega</span>
              {" "}— è la stessa pagina che ti rende visibile nel listino pubblico.
            </StepCard>
            <StepCard icon={faGear} title="2. L'associazione attiva lo sconto per te">
              In base all&apos;accordo preso con il comitato, l&apos;associazione imposta per la tua
              bottega una percentuale di sconto e una quantità totale di sconti disponibili (es.
              &quot;20%, 10 sconti&quot;). Non devi configurare nulla tu.
            </StepCard>
            <StepCard icon={faCamera} title="3. Scansiona il QR del cliente da /scan">
              Quando un socio ti mostra il suo QR, apri{" "}
              <span className="font-mono">/scan</span>
              {" "}dal tuo telefono (visibile solo a chi ha una bottega collegata al proprio
              account), inquadra il codice e scegli lo sconto da assegnare. Fatto: lo sconto è
              registrato e il contatore dei posti residui si aggiorna subito.
            </StepCard>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-ink/10 bg-cream-deep p-6">
          <h2 className="font-display text-lg font-bold text-ink">Un paio di cose da sapere</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>
              Non c&apos;è un limite di utilizzi a persona: un socio può farsi applicare lo stesso
              sconto più volte in occasioni diverse, finché per quella bottega restano posti
              disponibili.
            </li>
            <li>
              Il numero di sconti disponibili è deciso dall&apos;associazione insieme a ogni singola
              bottega, in base all&apos;accordo preso — non è un valore fisso uguale per tutti.
            </li>
            <li>
              Quando i posti di uno sconto finiscono, semplicemente non compare più tra quelli
              proponibili: l&apos;associazione può sempre attivarne uno nuovo in accordo con la
              bottega.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
