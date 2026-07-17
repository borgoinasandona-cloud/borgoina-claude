# CLAUDE.md — memoria di lavoro

Progetto: rifacimento sito + CMS "Borgo INA San Donà" (comitato di quartiere, San Donà di Piave).
Owner: Dario. Vedi PLANNING.md per scope completo e data model, README.md per setup.

## Stack fisso (non cambiare senza chiedere)

- Next.js (App Router), React
- PostgreSQL + Prisma
- Vercel (hosting/deploy)
- Cloudinary (tutte le immagini: loghi, cover, gallerie)
- Resend (email: form contatti, poi reset password/notifiche login)
- Auth.js v5 — Credentials in Fase 1, + Google OAuth in Fase 2 (stessa tabella `User`, non ricrearla)

## Regole del progetto

- **Niente i18n/multilingua** — non introdurre next-intl o routing `/it` `/en`
- **Niente redirect da URL legacy** — non serve mappare i vecchi permalink
- Admin in Fase 1 è **un solo utente** (email di Dario), ma il modello `User` va scritto fin da subito
  con `role` ed `Account`/`Session` di Auth.js, pensando alla Fase 2 (membri con login email/password + Google)
- Il campo `visibility` su `Post`/`Page` esiste da subito ma resta `PUBLIC` ovunque finché non si apre la Fase 2
- Immagini: caricare sempre su Cloudinary, mai servire da `/public` per contenuti gestiti da CMS
- Foto della Bacheca/gallerie: quelle fornite da Dario provengono dal sito attuale (spesso già ridimensionate) —
  se ci sono dubbi sulla risoluzione, segnalarlo invece di procedere assumendo che vadano bene
- Contenuto di `Page`/`Post` è **HTML**, non Markdown: editor WYSIWYG (Tiptap) in admin
  (`components/RichTextEditor.tsx`), reso in pubblico via `components/HtmlContent.tsx` che sanitizza
  con `sanitize-html` prima di `dangerouslySetInnerHTML` — non renderizzare mai HTML da DB senza
  passare da lì
- **Niente `isomorphic-dompurify`/jsdom lato server**: ha rotto `/il-borgo`, `/chi-siamo`, `/contatti`
  in produzione su Vercel (500) pur passando build/lint/tsc e `next start` locale — il bundling
  serverless di Vercel non include correttamente le dipendenze dinamiche di jsdom. Sostituito con
  `sanitize-html` (puro JS, nessuna dipendenza nativa/jsdom). Se serve sanitizzare HTML lato server,
  usare `sanitize-html` o testare sempre con un deploy reale prima di considerarlo verificato —
  `next build`/`next start` locali non bastano a intercettare questa classe di bug

## Stato attuale

- [x] Repo inizializzato
- [x] Schema Prisma da PLANNING.md creato (Account/Session/VerificationToken aggiunti per Auth.js),
      **migrato su Neon** (`DATABASE_URL` in `.env`, migrazione `20260716153602_init` applicata)
- [x] Setup Cloudinary — credenziali reali in `.env`, upload firmato (`lib/cloudinary.ts`,
      `api/upload/sign`) implementato; non ancora verificato un upload reale da UI
- [x] Setup Resend — chiave reale in `.env`; invio email non ancora verificato end-to-end;
      "from" usa ancora il dominio sandbox `onboarding@resend.dev` — **da verificare un dominio
      proprio su Resend prima di andare live**, altrimenti le email rischiano lo spam
- [x] Auth admin (Credentials) — verificato end-to-end (login con credenziali corrette → sessione
      valida → accesso a `/admin`; credenziali sbagliate e utenti anonimi vengono respinti)
- [x] Pagine statiche (Il Borgo, Chi Siamo, Contatti) — pubbliche + editor admin, contenuto vuoto finché
      non arrivano i testi reali da Dario
- [x] CRUD Bacheca (post + categorie + immagini) — codice completo, DB live ma non ancora popolato
      da UI (nessun articolo di prova creato)
- [ ] Import contenuti dal sito attuale — in `materiale/` ci sono solo immagini, non testi;
      `npm run cloudinary:import` è pronto per caricare le immagini su Cloudinary quando servirà
- [x] Form contatti → Resend — pagina `/contatti` con form (Server Action), salva anche su
      `ContactMessage` come fallback se l'invio email fallisce; invio email reale non ancora testato
- [ ] Fase 2: Google OAuth + area riservata

Utente admin creato in DB: `dario@terotero.com` (password impostata via `ADMIN_PASSWORD` in `.env`
al momento del seed — da cambiare prima di condividere l'accesso).

## Deploy

- Progetto Vercel: `terotero-s-projects/borgoina-claude`, collegato via `vercel link` (CLI, non da
  GitHub — il collegamento automatico GitHub→Vercel non è riuscito: la GitHub App di Vercel non ha
  accesso a `borgoinasandona-cloud/borgoina-claude`; per ora i deploy sono manuali via `vercel deploy --prod`)
- URL produzione: https://borgoina-claude-coral.vercel.app
- Variabili d'ambiente impostate su Vercel **solo per Production** (Preview aveva un bug della CLI
  su `git_branch_required` che non si è risolto nemmeno con la sintassi suggerita dall'errore stesso —
  da riprovare con una versione più recente della CLI, o impostarle a mano dalla dashboard se servono
  deploy di anteprima con dati reali)
- `.vercelignore` esclude `.env` e `materiale/` dall'upload (il primo deploy aveva incluso `.env` per
  errore nel bundle sorgente — nessuna nuova fuga di segreti, erano già gli stessi valori messi
  volontariamente nell'env store di Vercel, ma va comunque evitato)

(aggiornare questa checklist mano a mano, non lasciarla disallineata dal repo)

## Note per le sessioni future

- Prima di aggiungere una feature non prevista in PLANNING.md, aggiornare PLANNING.md invece di procedere e basta
- Se emergono decisioni sulle "Domande aperte" di PLANNING.md, riportarle qui e chiuderle nel planning doc
