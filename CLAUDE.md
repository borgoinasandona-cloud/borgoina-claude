# CLAUDE.md — memoria di lavoro

Progetto: rifacimento sito + CMS "Borgo INA San Donà" (comitato di quartiere, San Donà di Piave).
Owner: Dario. Vedi PLANNING.md per scope completo e data model, README.md per setup.

## Stack fisso (non cambiare senza chiedere)

- Next.js (App Router), React
- PostgreSQL + Prisma
- Vercel (hosting/deploy)
- Cloudinary (tutte le immagini: loghi, cover, gallerie)
- Resend (email: form contatti, poi reset password/notifiche login)
- Auth.js v5 — Credentials (admin + community) e Google OAuth, stessa tabella `User`. Session
  strategy `jwt` obbligata: Auth.js non supporta Credentials con sessioni `database`

## Convenzioni di progetto

Regole di prodotto, pattern ricorrenti nel codice e gotcha tecnici sono in `.claude/rules/`
(caricate automaticamente: alcune sempre, altre solo quando si tocca un file nel loro `paths:`) —
non duplicarle qui:

- [`regole-di-prodotto.md`](.claude/rules/regole-di-prodotto.md) — sempre caricata
- [`prisma-e-azioni-server.md`](.claude/rules/prisma-e-azioni-server.md) — `prisma/**`, `**/actions.ts`, `package.json`
- [`html-e-immagini.md`](.claude/rules/html-e-immagini.md) — editor/rendering HTML, Cloudinary, upload
- [`frontend-tailwind-e-icone.md`](.claude/rules/frontend-tailwind-e-icone.md) — `**/*.tsx`
- [`auth-authjs.md`](.claude/rules/auth-authjs.md) — `lib/auth.ts`, `lib/auth.config.ts`, `app/community/**`

## Comandi principali

- `npm run dev` — dev server (Next.js/Turbopack)
- `npx tsc --noEmit -p .` — type-check
- `npx eslint .` (o path specifici) — lint
- `npx prisma generate` — rigenera il client dopo modifiche a `schema.prisma` (già automatico via
  `postinstall`, utile in locale dopo un pull)
- `npx prisma migrate dev --name <nome>` — migration standard in locale (interattivo)
- Migration "distruttiva" non interattiva (vedi [`prisma-e-azioni-server.md`](.claude/rules/prisma-e-azioni-server.md)): `npx prisma migrate diff
  --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
  > migration.sql`, creare a mano la cartella in `prisma/migrations/`, poi `npx prisma migrate deploy`
- `npm run cloudinary:import` — import bulk di cartelle immagini da `materiale/`
- Deploy: **commit + push su `main`** (Vercel collegato a GitHub, deploy automatico) — mai
  `vercel deploy` manuale (vedi sezione Deploy sotto)

## Fasi completate

Dettaglio storico (decisioni prese, schema esatto, bug trovati/corretti, verifica) in
`docs/fasi/`. Qui solo un riepilogo sintetico, una riga per fase/area.

- [Setup iniziale](docs/fasi/00-setup-iniziale.md) — schema Prisma, Cloudinary, Resend, Auth admin,
  pagine statiche, CRUD Bacheca, import contenuti, redesign iniziale
- [Fase 3 — Bacheca community](docs/fasi/fase-3-bacheca-community.md) — annunci tra iscritti
  (mercatino), moderazione admin, commenti, messa in evidenza
- [Login Google e verifica email](docs/fasi/auth-google-e-verifica-email.md) — OAuth Google,
  verifica email obbligatoria, recupero password
- [Foto profilo e account](docs/fasi/foto-profilo-e-account.md) — upload foto profilo, redesign
  pagina `/community/account`
- [Fase 4 — Botteghe](docs/fasi/fase-4-botteghe.md) — pagina attività per iscritti, contatti, CTA
  WhatsApp, gestione admin
- [Header, menu e icone](docs/fasi/header-menu-e-icone.md) — redesign header/menu, icone QR/scan,
  avatar, allineamenti
- [Pagina Soci / Iscritti](docs/fasi/pagina-soci-iscritti.md) — elenco pubblico iscritti
- [Fase 5 — QR identificativo](docs/fasi/fase-5-qr-identificativo.md) — tessera digitale con QR
  firmato HMAC
- [Restyling visivo](docs/fasi/restyling-21-agosto.md) — palette cream, card "elevated", Open
  Graph/Twitter Card
- [Notifiche email admin](docs/fasi/notifiche-email-admin.md) — email automatiche su nuovi
  iscritti/annunci/botteghe
- [Fase 6 — Token sconto via QR](docs/fasi/fase-6-token-sconto.md) — offerte generiche riscattabili
  in bottega, poi rivisto da percentuale a title/description
- [Microcopy e icone CTA](docs/fasi/microcopy-e-icone-cta.md) — icone FontAwesome al posto di
  caratteri unicode, card mobile
- [Dashboard admin e mobile](docs/fasi/dashboard-e-admin-mobile.md) — statistiche, menu mobile, KPI
  piani gratuiti
- [Installazione come app (PWA)](docs/fasi/pwa-installazione.md) — bottone "Aggiungi a Home"
- [Fase 7 — RSVP eventi](docs/fasi/fase-7-eventi-rsvp.md) — prenotazioni eventi (cena di quartiere)

## Fase aperta

- [ ] Fase 2: area riservata (contenuti `visibility: PRIVATE` visibili solo a utenti autenticati) —
      il campo esiste ma non è ancora applicato/enforced da nessuna query pubblica

Utente admin creato in DB: `dario@terotero.com` (password impostata via `ADMIN_PASSWORD` in `.env`
al momento del seed — da cambiare prima di condividere l'accesso).

## Deploy

- **Progetto Vercel reale: `borgoina/borgoina-claude`** (team "Borgoina", owner account
  `borgoinasandona@gmail.com` / username `borgoinasandona-5180`) — **non** `terotero-s-projects`
  (quel progetto era un duplicato creato per errore in una sessione precedente e poi eliminato).
  Collegato a GitHub (`borgoinasandona-cloud/borgoina-claude`, branch `main`): un push su `main`
  fa partire il deploy da solo. **Il flusso normale è commit + push, non `vercel deploy`.**
- **URL produzione: https://borgoinasandona.it** (dominio proprio, acquistato il 2026-07-27 — non
  più un sottodominio di terotero.it). `www.borgoinasandona.it` e il vecchio
  `borgoinasandona.terotero.it` reindirizzano entrambi qui (redirect 308 configurati via API
  Vercel su `PATCH /v9/projects/{id}/domains/{domain}` con `redirect`/`redirectStatusCode`),
  path incluso (es. `/community` → `/community`, non solo la home). Resta raggiungibile anche
  `https://borgoina-claude.vercel.app` (dominio Vercel di default, nessun redirect impostato lì)
- Il mio account Vercel CLI di default (`dperissutti-5941`) **non è membro** del team `borgoina`
  (piano Hobby, non si possono invitare membri). Per operare da CLI/API su questo progetto serve un
  Access Token generato dall'account `borgoinasandona@gmail.com` (Settings → Tokens), passato con
  `--token` (mai salvato su disco/nel repo)
- **Tre problemi trovati e risolti sul progetto reale il 2026-07-17** (erano lì da quando il progetto
  è stato creato, il sito non ha mai funzionato pubblicamente prima di questo):
  1. `ssoProtection: "all_except_custom_domains"` bloccava l'accesso pubblico a tutti i domini
     `*.vercel.app` (compreso quello di produzione, dato che non c'è ancora un dominio custom
     collegato) — disattivata via API (`PATCH /v9/projects/{id}` con `ssoProtection: null`)
  2. `framework: null` (Framework Preset "Other" invece di "Next.js") faceva sì che Vercel
     deployasse solo la cartella `public/` come sito statico, **senza registrare nessuna funzione
     serverless** — root cause del 404 su ogni pagina. File statici (es. `/logo/...`) funzionavano,
     le route dell'app no: è il sintomo da riconoscere per questo bug. Corretto impostando
     `framework: "nextjs"` via API
  3. **Zero variabili d'ambiente** configurate su Production — impostate con gli stessi valori del
     `.env` locale (stesso identico processo già fatto in precedenza sul progetto duplicato)
- `.vercelignore` esclude `.env` e `materiale/` dall'upload

(quando si completa una fase o si avvia un lavoro nuovo di rilievo: aggiornare/creare il file
corrispondente in `docs/fasi/` con il dettaglio, e aggiungere/aggiornare la riga sintetica qui sopra
— non lasciare CLAUDE.md disallineato dal repo, ma nemmeno farlo tornare a crescere all'infinito:
il dettaglio va nei file di fase, qui resta solo indice)

## Note per le sessioni future

- Prima di aggiungere una feature non prevista in PLANNING.md, aggiornare PLANNING.md invece di procedere e basta
- Se emergono decisioni sulle "Domande aperte" di PLANNING.md, riportarle qui e chiuderle nel planning doc
- Dettaglio storico delle fasi (decisioni, schema, bug, verifica) va in `docs/fasi/<nome>.md`, non
  qui — questo file resta stack, comandi e un indice sintetico linkato
- Regole/convenzioni (di prodotto, pattern di codice, gotcha tecnici) vanno in `.claude/rules/`, un
  file per argomento, con frontmatter `paths:` quando la regola riguarda solo certi file/cartelle —
  non riscriverle qui né in `docs/fasi/`
