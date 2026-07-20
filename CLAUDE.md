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
- [x] Schema Prisma: bacheca community (`CommunityPost`, `Comment`, enum `CommunityPostType`/
      `CommunityPostStatus`/`CommentVisibility`, `Visibility.PENDING`) — vedi PLANNING.md "Fase 3".
      Migrato su Neon in due migration separate (`20260719145500_add_visibility_pending` poi
      `20260719145041_add_community_bacheca`): Postgres non permette di usare un nuovo valore enum
      come `DEFAULT` di colonna nella stessa transazione in cui viene aggiunto (errore `55P04`) —
      se in futuro serve aggiungere un altro valore a un enum esistente E usarlo subito in una
      colonna/tabella nuova, va sempre spezzato in due migration
- [x] Bacheca community — implementata end-to-end (schema + UI):
      - Registrazione/login soci: `/community/register`, `/community/login` (Credentials, ruolo
        `MEMBER`, stesso meccanismo di login dell'admin — vedi `lib/auth.ts`). Login Google
        aggiunto il 2026-07-20 (vedi voce dedicata più sotto), nessuna verifica email per Credentials
      - Pubblicazione annunci (`/community/new`, richiede login) e listino/dettaglio pubblici
        (`/community`, `/community/[slug]`), con filtro per tipo e cover image opzionale (upload
        Cloudinary via `/api/upload/sign`, ora aperto a qualunque utente loggato e non più solo ADMIN)
      - Ogni annuncio nasce `visibility: PENDING`; moderazione admin in `/admin/community`
        (Approva → `PUBLIC`, Rifiuta → `PRIVATE`, Elimina). L'autore vede il proprio annuncio anche
        da `PENDING`/`PRIVATE` con un banner di stato; chiunque altro riceve 404 finché non è `PUBLIC`
      - L'autore può aggiornare lo `status` (disponibile/in sospeso/chiuso) ed eliminare il proprio
        annuncio da `/community/[slug]`
      - Commenti: chiunque sia loggato può commentare; la regola "sui post di tipo oggetto i commenti
        sono visibili solo tra autore e chi commenta" è implementata in
        `lib/community.ts` → `filterVisibleComments()` — **approssimazione nota**: non essendoci un
        campo di threading nello schema (nessun `parentId`), un utente che ha già commentato vede
        anche tutti i commenti scritti dall'autore ad altri commentatori (non i commenti altrui,
        solo le risposte dell'autore) — non è un vero isolamento per-thread, va tenuto a mente se in
        futuro serve una privacy più stretta
      - **Bug reale trovato e corretto durante il testing E2E**: `lib/auth.config.ts` → callback
        `session` impostava `session.user.role` ma non `session.user.id` (restava `undefined` pur
        con `session.user` troncato/definito) — passava inosservato ovunque nel codice si controllasse
        solo `if (!session?.user)`, ma rompeva in silenzio qualunque check più specifico su
        `session.user.id` (es. la creazione di un post community, che sembrava fallire "a caso" con
        un redirect al login). Corretto copiando `token.sub` in `session.user.id`; il tipo `Session`
        in `types/next-auth.d.ts` ora dichiara `id: string` come obbligatorio (non più opzionale via
        `DefaultSession`) proprio per intercettare in futuro regressioni di questo tipo a compile-time
      - Testato end-to-end con Playwright (registrazione → post PENDING → nascosto al pubblico →
        approvazione admin → visibile → regola commenti verificata con 3 utenti reali), dati di
        test ripuliti dal DB di produzione dopo la verifica
      - Pagina account soci (`/community/account`): l'iscritto modifica nome/email/password
        (ogni modifica richiede la password attuale per conferma, verificata con `bcrypt.compare`)
        e fa logout. Link "Il mio account" visibile su `/community` solo se loggato. **Nota**: la
        sessione usa strategy JWT — se un socio cambia nome/email, il cookie di sessione resta con
        i valori vecchi finché non rifà login (la pagina account stessa e tutte le query pubbliche
        leggono sempre nome/email freschi da Prisma via `session.user.id`, mai dal token, quindi
        non c'è disallineamento visibile — ma va tenuto a mente se in futuro si legge
        `session.user.name`/`session.user.email` altrove)
      - Categorie ristrutturate il 2026-07-20: Oggetti (Regalo/Vendo/Presto) e Servizi e lavori
        (Offro/Chiedo) — rimossa la categoria Segnalazioni/eventi (quel contenuto vive nella
        bacheca news). Aggiunto valore enum `SERVICE_OFFER`; `ISSUE`/`ANNOUNCEMENT` restano
        nell'enum Postgres ma non sono più selezionabili. Corretta anche una cronologia di
        migration fuori ordine (vedi commit `91949a9`)
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
- [x] Login Google (Auth.js v5 + `@auth/prisma-adapter`, aggiunto il 2026-07-20):
      - Modelli `User`/`Account`/`Session`/`VerificationToken` erano già nello schema nel formato
        richiesto dall'adapter fin dallo scaffold iniziale — nessuna migration necessaria
      - **Session strategy resta `jwt`, non `database`**: Auth.js non supporta il Credentials
        provider con sessioni `database` (limitazione intenzionale, documentata — vedi
        https://authjs.dev/concepts/session-strategies). Passare a `database` avrebbe rotto il
        login sia admin sia soci esistenti; `jwt` funziona perfettamente anche con provider OAuth
      - `GoogleProvider` in `lib/auth.ts` con `clientId`/`clientSecret` passati esplicitamente da
        `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (nomi storici del progetto, non gli
        `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` che Auth.js v5 inferirebbe automaticamente)
      - Nuovo utente Google → `role: MEMBER` di default (schema, invariato); nessun modo per
        ottenere `ADMIN` via OAuth, resta assegnabile solo a mano/seed
      - `allowDangerousEmailAccountLinking` **non** impostato (resta `false`, il default sicuro di
        Auth.js): se un'email ha già un account Credentials, un login Google con la stessa email
        viene rifiutato (`OAuthAccountNotLinked`) invece di collegarsi automaticamente — scelta
        deliberata per non fidarsi ciecamente del match email senza una decisione esplicita
      - Pulsante "Continua con Google" su `/community/login` e `/community/register`
        (`components/GoogleSignInButton.tsx`, azione `signInWithGoogleAction`)
      - Header pubblico ora riceve la sessione da `app/layout.tsx` (Server Component, `await auth()`)
        e la passa come prop a `Header` (Client Component): mostra "Accedi" da sloggati,
        nome utente + "Esci" da loggati, sia in versione desktop sia nel modale mobile.
        **Effetto collaterale**: il layout root ora legge i cookie ad ogni richiesta, quindi tutte
        le pagine sono diventate `ƒ` (dynamic) invece di poter restare `○` (static) — inevitabile
        per un header che mostra lo stato di login
      - Verificato in locale (dove funziona): redirect a `accounts.google.com` con `client_id`/
        `redirect_uri`/`scope` corretti (non è possibile automatizzare un login Google reale via
        Playwright); nessuna regressione su login admin e login/registrazione community
        Credentials esistenti, sia in locale sia in produzione
      - **Bloccante confermato in produzione, da correggere su Google Cloud Console (non nel
        codice)**: il pulsante Google su `https://borgoina-claude.vercel.app` restituisce
        `redirect_uri_mismatch` — il progetto OAuth su Google Cloud Console non ha ancora
        `https://borgoina-claude.vercel.app/api/auth/callback/google` tra gli "Authorized redirect
        URIs" (funziona invece in locale, dove `http://localhost:3000/...` evidentemente è già
        autorizzato). `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` sono già su Vercel Production —
        manca solo questo passaggio lato Google per sbloccare il login in produzione
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
