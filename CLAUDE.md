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
- **`package.json` ha `postinstall: "prisma generate"`, non toglierlo**: senza, un deploy Vercel dopo
  una modifica a `schema.prisma` (con `package.json`/lockfile invariati) può riusare `node_modules`
  dalla cache con un Prisma Client stantio e fallire il build con errori di tipo su campi che esistono
  nello schema ma non nel client generato
- **Attenzione alla cascata CSS in `app/globals.css`**: regole CSS "semplici" (fuori da `@layer`)
  battono sempre le utility Tailwind di `@layer utilities`, indipendentemente dall'ordine nel markup
  — successo due volte in questa sessione (un colore hardcoded su `.eyebrow` che sovrascriveva ogni
  `text-*` usato insieme, e lo sfondo del `body` che non rispondeva a `bg-white`). Se una utility
  Tailwind sembra "non applicarsi", controllare prima le regole non-layered in globals.css

## Stato attuale

- [x] Repo inizializzato
- [x] Schema Prisma da PLANNING.md creato (Account/Session/VerificationToken aggiunti per Auth.js),
      **migrato su Neon** (`DATABASE_URL` in `.env`, migrazione `20260716153602_init` applicata).
      Aggiunto anche `Post.featured Boolean @default(false)` (migrazione `20260718104149_add_post_featured`,
      non prevista nel bozza originale di PLANNING.md — vedi sezione "In evidenza" più sotto)
- [x] Setup Cloudinary — credenziali reali in `.env`, upload firmato (`lib/cloudinary.ts`,
      `api/upload/sign`) implementato; usato con successo per caricare le cover dei 16 articoli
      Bacheca importati (via script una tantum, non ancora testato un upload reale dalla UI admin)
- [x] Setup Resend — chiave reale in `.env`; invio email non ancora verificato end-to-end;
      "from" usa ancora il dominio sandbox `onboarding@resend.dev` — **da verificare un dominio
      proprio su Resend prima di andare live**, altrimenti le email rischiano lo spam
- [x] Auth admin (Credentials) — verificato end-to-end (login con credenziali corrette → sessione
      valida → accesso a `/admin`; credenziali sbagliate e utenti anonimi vengono respinti)
- [x] Pagine statiche (Il Borgo, Chi Siamo, Contatti) — pubbliche + editor admin. **Il Borgo e Chi
      Siamo hanno contenuto reale pubblicato** (testi/immagini recuperati dal sito attuale e scritti
      su DB). **Contatti resta senza contenuto CMS** (mostra solo l'email statica + form) — nessun
      testo introduttivo fornito finora
- [x] CRUD Bacheca (post + categorie + immagini) — codice completo, **popolata con i 16 articoli
      importati dal listino del sito attuale** (cover, titolo, estratto, categoria — vedi sotto)
- [x] Import contenuti dal sito attuale — completato per Il Borgo, Chi Siamo e i 16 articoli Bacheca
      (cover + titolo + estratto + categoria, dalla pagina `/it/news/` del sito attuale); immagini
      caricate su Cloudinary via script una tantum (poi cancellati, non è rimasta pipeline riusabile).
      `npm run cloudinary:import` resta disponibile per import bulk di cartelle da `materiale/`
- [x] Form contatti → Resend — pagina `/contatti` con form (Server Action), salva anche su
      `ContactMessage` come fallback se l'invio email fallisce; invio email reale non ancora testato
- [x] Redesign front-end pubblico applicando la skill `.claude/skills/frontend-design/` — palette
      brick/terracotta ispirata al logo e all'architettura in mattoni del quartiere, font Big
      Shoulders/Work Sans/IBM Plex Mono, breakpoint custom `wide` a 1570px per monitor grandi,
      sfondo sito bianco con `--color-cream` portato a `#f4f2f2`
- [x] Header pubblico: overlay trasparente con logo bianco sopra le pagine con hero-foto (`/`,
      `/il-borgo`), diventa solido allo scroll; link "Home" rimosso (resta il logo cliccabile),
      icona Instagram a destra (link da `NEXT_PUBLIC_INSTAGRAM_URL`); sotto `md` il menu si nasconde
      in un hamburger (`components/MenuIcons.tsx`) che forza l'header in versione solida quando aperto
- [x] Badge "🖼️ Galleria" sulle card/articoli Bacheca che hanno immagini in galleria o `externalLink`
      (`lib/posts.ts` → `hasGallery()`, `components/GalleryBadge.tsx`)
- [x] Campo "In evidenza" su `Post` (admin: checkbox in `PostForm.tsx`) — se true, l'articolo appare
      nella sezione "Il Borgo utile" della home al posto del più recente (`getFeaturedPost()` in
      `lib/posts.ts`, con fallback al post più recente se nessuno è marcato)
- [x] Admin: nav raggruppata in "Pagine" (Il Borgo/Chi siamo/Contatti) e "Articoli" (Bacheca/Categorie);
      lista Bacheca ordinata per data di pubblicazione decrescente
- [ ] Fase 2: Google OAuth + area riservata

Utente admin creato in DB: `dario@terotero.com` (password impostata via `ADMIN_PASSWORD` in `.env`
al momento del seed — da cambiare prima di condividere l'accesso).

## Deploy

- **Progetto Vercel reale: `borgoina/borgoina-claude`** (team "Borgoina", owner account
  `borgoinasandona@gmail.com` / username `borgoinasandona-5180`) — **non** `terotero-s-projects`
  (quel progetto era un duplicato creato per errore in una sessione precedente e poi eliminato).
  Collegato a GitHub (`borgoinasandona-cloud/borgoina-claude`, branch `main`): un push su `main`
  fa partire il deploy da solo. **Il flusso normale è commit + push, non `vercel deploy`.**
- URL produzione: https://borgoina-claude.vercel.app
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

(aggiornare questa checklist mano a mano, non lasciarla disallineata dal repo)

## Note per le sessioni future

- Prima di aggiungere una feature non prevista in PLANNING.md, aggiornare PLANNING.md invece di procedere e basta
- Se emergono decisioni sulle "Domande aperte" di PLANNING.md, riportarle qui e chiuderle nel planning doc
