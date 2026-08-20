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
        aggiunto il 2026-07-20 (vedi voce dedicata più sotto). Verifica email obbligatoria per
        Credentials aggiunta il 2026-07-30 (vedi voce dedicata più sotto)
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
      - **Bug reale trovato e corretto il 2026-07-21**: chi si era registrato solo con Google
        (`User.password` = `null`) non poteva salvare NESSUNA modifica su `/community/account`,
        perché il form chiedeva sempre la password attuale per confermare — password che un
        account solo-OAuth non ha mai avuto. La pagina ora calcola `hasPassword` lato server
        (`!!user.password`) e lo passa al form: se `false`, il campo "Password attuale" resta
        nascosto e la action salta del tutto quel controllo (l'identità è già garantita dalla
        sessione OAuth); se l'utente vuole può comunque impostare una password per poter accedere
        anche via Credentials in futuro. Corretto anche un bug collaterale scoperto testando
        questo fix: `formData.get("currentPassword")` restituisce `null` (non `undefined`) quando
        il campo non è nel DOM, e lo schema Zod (`z.string().optional().or(z.literal(""))`)
        accetta `undefined`/`""` ma non `null` — falliva con un generico "Invalid input" anche a
        campo correttamente nascosto. Risolto normalizzando a `formData.get(...) || ""` come già
        si faceva per `newPassword`
      - Categorie ristrutturate il 2026-07-20: Oggetti (Regalo/Vendo/Presto) e Servizi e lavori
        (Offro/Chiedo) — rimossa la categoria Segnalazioni/eventi (quel contenuto vive nella
        bacheca news). Aggiunto valore enum `SERVICE_OFFER`; `ISSUE`/`ANNOUNCEMENT` restano
        nell'enum Postgres ma non sono più selezionabili. Corretta anche una cronologia di
        migration fuori ordine (vedi commit `91949a9`)
- [x] Setup Cloudinary — credenziali reali in `.env`, upload firmato (`lib/cloudinary.ts`,
      `api/upload/sign`) implementato; usato con successo per caricare le cover dei 16 articoli
      Bacheca importati (via script una tantum, non ancora testato un upload reale dalla UI admin)
- [x] Setup Resend — chiave reale in `.env`. **Dominio `borgoinasandona.it` verificato su Resend
      (SPF/DKIM) il 2026-07-27**: `lib/resend.ts` usa `noreply@borgoinasandona.it` invece del
      sandbox `onboarding@resend.dev`. Verificato inviando una email reale via API (accettata con
      un message id, prova che il dominio è verificato — un dominio non verificato viene rifiutato
      subito da Resend) — testato anche end-to-end nel browser sul form `/contatti` in produzione
      (submit reale → conferma a video, dato di test ripulito da `ContactMessage`)
- [x] **`RESEND_API_KEY` ruotata il 2026-07-29** tramite l'integrazione nativa Vercel↔Resend (nuova
      chiave creata e iniettata automaticamente come env var su Vercel). Verificato che la nuova
      chiave possa ancora inviare da `noreply@borgoinasandona.it` (stesso account/dominio Resend,
      nessuna riconfigurazione necessaria); `.env` locale aggiornato di conseguenza. La vecchia
      chiave risultava ancora attiva al momento del check — se non serve più come backup, va
      revocata a mano dalla dashboard Resend (non automatizzabile da qui)
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
      `/il-borgo`), diventa solido allo scroll (comportamento invariato dallo scaffold iniziale).
      **Struttura del menu ridisegnata il 2026-07-30/31**: la versione originale qui descritta
      (link "Home" rimosso, hamburger solo sotto `md`, "Esci" visibile nel menu) è superata — vedi
      la voce dedicata più sotto ("Header/menù ridisegnati") per lo stato attuale
- [x] Badge "Galleria" sulle card/articoli Bacheca che hanno immagini in galleria o `externalLink`
      (`lib/posts.ts` → `hasGallery()`, `components/GalleryBadge.tsx` — icona Font Awesome
      `faImage` regular dal 2026-07-30, non più l'emoji 🖼️ originale)
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
        e la passa come prop a `Header` (Client Component): mostra "Accedi" da sloggati, nome
        utente (+ avatar dal 2026-07-30) da loggati — il logout si fa da `/community/account`, non
        dal menu, da quando "Esci" è stato tolto dal menu (vedi commit `4c0a33d`, precedente a
        questa sessione). **Effetto collaterale**: il layout root ora legge i cookie ad ogni richiesta, quindi tutte
        le pagine sono diventate `ƒ` (dynamic) invece di poter restare `○` (static) — inevitabile
        per un header che mostra lo stato di login
      - Verificato in locale e in produzione: redirect a `accounts.google.com` con `client_id`/
        `redirect_uri`/`scope` corretti; nessuna regressione su login admin e login/registrazione
        community Credentials esistenti
      - **Due bug reali trovati e corretti dopo il deploy, testando il login Google dal vivo**:
        1. `redirect_uri_mismatch` — il progetto OAuth su Google Cloud Console non aveva
           l'URI di callback autorizzato; risolto da Dario lato Google Cloud Console (non nel
           codice), aggiungendo sia `https://borgoina-claude.vercel.app/api/auth/callback/google`
           sia quello del dominio custom `https://borgoinasandona.terotero.it/api/auth/callback/google`
        2. Dopo il consenso Google, la callback falliva con l'errore generico
           `/api/auth/error?error=Configuration` ("Server error... check the server logs") — causa
           reale: il modello `User` non aveva i campi `emailVerified`/`image` richiesti dallo
           schema Prisma di riferimento di Auth.js (https://authjs.dev/getting-started/adapters/prisma).
           `@auth/prisma-adapter`'s `createUser` passa l'intero oggetto `AdapterUser` (incluso
           `emailVerified: null`) direttamente a `prisma.user.create()`: con quei campi assenti
           dallo schema, Prisma rifiutava l'insert e Auth.js mascherava l'errore reale con la
           pagina generica "Configuration" (il messaggio "check the server logs" è letterale — il
           dettaglio non arriva mai al client per motivi di sicurezza). Diagnosticato leggendo
           direttamente `node_modules/@auth/prisma-adapter/index.js` e confrontando con lo schema
           Prisma ufficiale di Auth.js, poi confermato riproducendo la stessa chiamata
           (`prisma.user.create({ data: { email, emailVerified: null, name, image } })`) prima e
           dopo la migration. Risolto aggiungendo `emailVerified DateTime?` e `image String?` a
           `User` (migrazione `20260721090930_add_user_emailverified_image`, additiva, nessun
           rischio per i dati esistenti) — **se in futuro si integra un altro provider OAuth,
           controllare sempre lo schema `User` contro il riferimento Prisma ufficiale di Auth.js,
           non solo Account/Session/VerificationToken**
      - **Migrazione dominio (2026-07-27)**: aggiunto `https://borgoinasandona.it/api/auth/callback/google`
        ai redirect URI autorizzati su Google Cloud Console (da Dario); verificato che il login
        Google funzioni sul nuovo dominio (redirect a `accounts.google.com` con `redirect_uri`
        corretto)
- [x] **Verifica email + recupero password (2026-07-30)**:
      - Riusa la tabella standard `VerificationToken` di Auth.js (mai toccata dal provider
        Credentials) per entrambi i flussi: token esadecimale casuale con prefisso `ev_`
        (verifica email, scadenza 24h) o `pr_` (reset password, scadenza 1h) — vedi `lib/tokens.ts`.
        Nessuna migration necessaria, il modello esisteva già dallo scaffold Auth.js
      - Registrazione (`app/community/register/actions.ts`): non fa più auto-login. Crea l'utente
        con `emailVerified: null`, invia un'email con link `/community/verify-email?token=...`
        (`lib/resend.ts` → `sendVerificationEmail`) e mostra un messaggio "controlla la tua email"
      - Il gate vero e proprio è in `lib/auth.ts` → `authorize()`: se `user.emailVerified` è
        `null` lancia `EmailNotVerifiedError` (sottoclasse di `CredentialsSignin` con
        `code: "email-not-verified"`), letta poi in `communityLoginAction`/`loginAction` per
        mostrare un messaggio dedicato invece del generico "credenziali non valide", con un
        pulsante "Rinvia email di conferma" (`components/ResendVerificationForm.tsx`,
        `app/community/verify-email/actions.ts`). **Il gate riguarda solo il provider
        Credentials**: gli utenti Google passano dal flusso OAuth (che non chiama mai
        `authorize()`), quindi non ne sono toccati
      - Recupero password: `/community/forgot-password` → `/community/reset-password?token=...`
        (`lib/resend.ts` → `sendPasswordResetEmail`). Risposta sempre identica indipendentemente
        dal fatto che l'email esista o meno, per non rivelare quali indirizzi sono registrati.
        Cliccare un link di reset valido marca anche `emailVerified` se non lo era già (prova
        equivalente di possesso della casella), poi fa auto-login con la nuova password
      - Link "Password dimenticata?" aggiunto anche su `/admin/login`: stesso flusso, stessa
        tabella `User` — niente sistema separato per l'admin
      - **Backfill obbligatorio prima del deploy**: senza toccare i dati esistenti, il gate
        avrebbe bloccato all'istante ogni account Credentials già esistente (admin incluso, dato
        che il seed non ha mai valorizzato `emailVerified`). Risolto con uno script una tantum
        (`npx tsx`, poi cancellato) che marca `emailVerified = now()` per tutti gli utenti con
        `password IS NOT NULL AND emailVerified IS NULL` **prima** del push — eseguito il
        2026-07-30 sul DB di produzione (3 account: i due admin + un utente di test residuo)
      - Caso limite gestito: un account nato solo con Google (`password: null`) che imposta una
        password da `/community/account` non aveva mai ricevuto un link di verifica — senza
        correzione sarebbe rimasto bloccato al primo login Credentials. `updateAccountAction` ora
        marca anche `emailVerified` in quel momento (vedi commento in
        `app/community/account/actions.ts`)
      - Nuova env var **`NEXT_PUBLIC_SITE_URL`** (base per i link assoluti nelle email): impostata
        da Dario su Vercel Production a `https://borgoinasandona.it` il 2026-07-30 (in locale
        resta `http://localhost:3000`, vedi `.env.example`)
      - Testato end-to-end in locale con Playwright contro un utente reale creato via UI
        (registrazione → login bloccato → rinvio conferma → verifica via token letto dal DB →
        login riuscito → token riusato rifiutato → token falso rifiutato → recupero password →
        nuova password funzionante, vecchia rifiutata → token di reset falso rifiutato), dati di
        test ripuliti dal DB subito dopo
- [x] **Foto profilo utenti (2026-07-30)**: upload della propria foto da `/community/account`
      (`components/AccountForm.tsx`, riusa `components/ImageUploader.tsx`/`/api/upload/sign` già
      esistenti — stesso upload firmato Cloudinary usato per le cover Bacheca/community, nessun
      endpoint nuovo). Salvata come URL completo in `User.image` (campo già esistente dallo
      scaffold Auth.js, finora usato solo dall'avatar Google mai letto altrove nel codice), con
      pulsante "Rimuovi foto" per tornare a `null`. Placeholder con iniziali quando non impostata
      - `authorize()` in `lib/auth.ts` ora restituisce anche `image`: prima solo il login Google
        popolava `session.user.image` (l'adapter carica l'intero record utente), il login
        Credentials perdeva l'avatar caricato dall'utente
      - Avatar mostrato in `Header.tsx` accanto al nome (desktop + pannello mobile), con lo stesso
        limite già noto per nome/email: sessione `jwt`, quindi l'header mostra il valore aggiornato
        solo dal login successivo, non nella sessione corrente in cui l'utente ha appena caricato
        la foto — verificato esplicitamente nel test (stesso comportamento, non una regressione)
      - Testato end-to-end in locale con Playwright: upload reale su Cloudinary → preview → salvataggio
        → valore persistito in `User.image` → avatar assente nella sessione corrente ma presente
        dopo un nuovo login → rimozione foto → torna a `null` nel DB. Dati e immagine di test
        ripuliti dopo la verifica (l'immagine caricata su Cloudinary durante il test resta, è un
        1x1 px trascurabile — nessuna pipeline di pulizia Cloudinary in questo progetto)
- [x] **Header/menù ridisegnati (2026-07-30/31)**: hamburger sempre visibile a tutti i breakpoint
      (prima solo sotto `md`) invece della nav desktop — apre lo stesso modale a tutta larghezza,
      ora su 2 colonne (Home/Il Borgo/Chi siamo/Contatti/Botteghe a sinistra, Bacheca/Community/
      Instagram con pillole colorate a destra, filo verticale color cielo a dividerle), voci in
      font display (Big Shoulders) invece del mono maiuscolo piccolo, focus da tastiera visibile.
      "Accedi" è ora una pillola piena `rounded-full` color brick (CTA vera, distinta dagli altri
      bottoni squadrati del sito); l'account già loggato (avatar+nome) resta un link semplice.
      Font Awesome (stile regular, `lib/fontawesome.ts`) adottato come famiglia di icone al posto
      di emoji/SVG custom: commento (`f075`), immagine/galleria, hamburger/chiudi (solo in solid,
      non esistono in regular) e Instagram (solo nel set brands) — restano emoji solo negli editor
      admin (`RichTextEditor.tsx`, `PostForm.tsx`), non toccati. Footer: aggiunto "credits: TeroTero"
      (link a terotero.it) accanto al copyright
- [x] **Botteghe (2026-07-31)**: pagina di presentazione della propria attività per gli iscritti —
      vedi PLANNING.md "Fase 4" per la descrizione funzionale. Note implementative:
      - Modelli `Shop`/`ShopImage` + enum `ShopCategory` in `prisma/schema.prisma` (migration
        `20260731090741_add_shop`), riusa l'enum `Visibility` esistente — nessun problema di
        "nuovo valore enum usato subito" incontrato con `CommentVisibility` in Fase 3, perché qui
        non si aggiunge un valore nuovo, solo nuove tabelle che referenziano l'enum già presente
      - `authorId String @unique` su `Shop` applica "una bottega per utente" a livello DB, non solo
        in app
      - `lib/shops.ts` e `app/community/bottega/actions.ts` rispecchiano quasi 1:1 `lib/community.ts`
        e le action di `CommunityPost` (stesso `requireUser()`/`requireAdmin()`). La galleria
        immagini (`ShopImage`) segue invece il pattern di `PostImage`/
        `app/admin/(dashboard)/posts/actions.ts`: stato locale `images` nel form, hidden input
        `imagesJson`, sostituzione con transazione `deleteMany` + `create` lato server
      - **Niente moderazione preventiva (cambiato il 2026-07-31)**: la prima versione nasceva
        `visibility: PENDING` con approvazione admin, come `CommunityPost` — tolta su richiesta
        esplicita. `Shop.visibility` ora ha `@default(PUBLIC)` (migration
        `20260731095028_shop_public_by_default`, nessuna riga reale da migrare: la feature era
        appena stata rilasciata, zero bottege create da utenti veri). Il campo `visibility` resta
        nel modello e nell'enum condiviso `Visibility` solo per dare all'admin un modo non
        distruttivo di nascondere contenuti inappropriati a posteriori (`/admin/botteghe` →
        pulsanti "Nascondi"/"Pubblica", azioni `hideShopAction`/`publishShopAction` in
        `app/admin/(dashboard)/botteghe/actions.ts`, rinominate da `rejectShopAction`/
        `approveShopAction`) — `PENDING` non viene più impostato da nessun percorso applicativo
      - Modificare una bottega già pubblica non la nasconde né la tocca in alcun modo lato
        visibilità (nessuna moderazione da re-innescare, a differenza di quanto valutato per
        `CommunityPost`)
      - Autore **in evidenza** sulla pagina pubblica: blocco "Gestita da" con avatar
        (`User.image`, la stessa foto profilo di Fase 2) o iniziali come fallback, subito sotto il
        titolo in `app/botteghe/[slug]/page.tsx` — riflette la logica esplicita del prodotto: chi
        si iscrive alla community può avere anche una pagina della propria attività, e la pagina
        deve restare visibilmente legata a quella persona
      - Categoria (`ShopCategory`: `CRAFTS`/`SHOP`/`FOOD`/`SERVICES`/`OTHER`) è un enum fisso come
        `CommunityPostType`, non un modello `Category` gestibile da admin come per `Post` — scelta
        per coerenza con l'unico altro precedente di categorizzazione "generata dagli iscritti"
      - "Botteghe" inizialmente lasciata come link semplice nel menù; spostata su richiesta
        nella colonna "Partecipa" come terza pillola colorata accanto a Bacheca/Community
        (`navLinkAccentClasses` esteso con un terzo accent `"brick"`, `bg-brick text-white
        hover:bg-brick-dark` — stesso `brick` del bottone Accedi ma `text-white` invece di
        `text-cream` per restare leggermente distinta, non c'è una quarta tinta libera in
        palette)
      - Testato end-to-end con Playwright (due giri, prima e dopo la rimozione della moderazione):
        creazione → subito `PUBLIC` e visibile su `/botteghe` senza alcun intervento admin →
        blocco "Gestita da" presente con nome/iniziali corretti → filtro categoria funziona →
        dettaglio pubblico mostra contatti/indirizzo/galleria → admin nasconde (404 pubblico
        immediato) e ripubblica da `/admin/botteghe` → modifica dell'autore non cambia la
        visibilità → eliminazione. Dati di test ripuliti dal DB di produzione dopo la verifica
      - **Campi "Chi siamo"/"Contatti" + CTA (2026-07-31)**: aggiunti a `Shop` `slogan`,
        `history` ("da quanti anni esiste/storia"), `whyChooseUs` ("perché sceglierci"),
        `instagram` (canale della bottega, distinto da `siteConfig.instagramUrl` del comitato) e
        `hours` (orari, testo libero multi-riga) — migration
        `20260731102931_shop_about_and_contact_fields`. `ShopForm.tsx` riorganizzato in due sezioni
        con divisore (`SectionHeading`, stile eyebrow): "Chi siamo" (slogan, descrizione, storia,
        perché sceglierci) subito dopo il campo categoria, poi "Contatti" (indirizzo, telefono/
        WhatsApp, email, sito, Instagram, orari)
      - Pagina pubblica: slogan come tagline corsiva sotto il titolo; card del listino
        (`ShopCard.tsx`) mostra lo slogan al posto dell'estratto della descrizione quando presente
        (è letteralmente il suo scopo — una frase corta ad effetto per il listino); storia e
        "perché sceglierci" come blocchi separati sotto la descrizione; sezione "Contatti" con
        icone (indirizzo, orari, email, sito, Instagram)
      - **Pulsanti CTA automatici**: "Scrivimi su WhatsApp" (verde brand WhatsApp `#25D366`,
        icona `faWhatsapp` da `free-brands-svg-icons` — il logo non esiste in regular/solid) e
        "Chiama ora" (outline, `tel:`), mostrati solo se `phone` è valorizzato. Il numero italiano
        inserito dall'iscritto (es. "340 1234567", senza prefisso) va convertito in formato
        internazionale per il link `wa.me`: `lib/phone.ts` → `toWhatsAppNumber()` normalizza
        aggiungendo `39` se il numero non ha già un prefisso paese — approssimazione dichiarata,
        pensata per numeri italiani (il sito è per un comitato di quartiere locale, non per un
        pubblico internazionale)
      - Testato end-to-end con Playwright: tutti i nuovi campi salvati e mostrati nell'ordine
        corretto nel form, pagina pubblica mostra slogan/storia/perché-sceglierci/contatti/orari,
        link WhatsApp verificato byte-per-byte (`340 1234567` → `https://wa.me/393401234567`),
        link "Chiama ora" (`tel:340 1234567`) e Instagram della bottega corretti, card del listino
        mostra lo slogan. Dati di test ripuliti dopo la verifica
      - **Sezione Contatti in card (2026-07-31)**: da lista verticale con icona a griglia di
        card (`grid sm:grid-cols-2`, componente locale `ContactCard` in
        `app/botteghe/[slug]/page.tsx`) — stesso stile `rounded border border-ink/10 bg-white
        shadow-sm` già usato per il box del modulo di contatto in `/contatti`, icona in un
        cerchietto `bg-brick/10 text-brick`. Verificato visivamente desktop e mobile
      - **Admin può modificare i contenuti di una bottega altrui (2026-07-31)**: nuova pagina
        `/admin/botteghe/[id]/edit` (link "Modifica" in `/admin/botteghe`), riusa `ShopForm.tsx`
        — reso generico con una prop `action` opzionale (default `saveShopAction` per l'iscritto),
        l'admin passa `adminUpdateShopAction.bind(null, shop.id)` che opera sull'`id` invece che su
        `authorId === utente loggato`. Il parsing del form (`parseShopFormData`) è stato spostato
        da `app/community/bottega/actions.ts` a `lib/shops.ts` per essere condiviso dalle due
        action: un file con `"use server"` in cima richiede che **ogni** export sia una funzione
        async (build error altrimenti — `parseShopFormData` è sync), quindi non poteva restare in
        un file azioni. `ShopFormState` ora ha anche `"success"` (prima solo `idle`/`error`, perché
        il salvataggio dell'iscritto fa sempre redirect e non tornava mai "success"; il salvataggio
        admin invece resta sulla pagina e mostra conferma inline, come `updatePostAction`).
        Modificare non tocca `visibility` né lo `slug`. `ShopForm` riusato così com'è (stile
        brand pubblico, cream/brick) dentro il layout admin (grigio neutro) — visivamente un po'
        diverso dal resto di `/admin` ma nessuna duplicazione del form; accettabile, non
        richiesto altrimenti. Testato end-to-end: un iscritto non-admin non può aprire la pagina
        (redirect a `/admin/login`), l'admin apre da `/admin/botteghe`, modifica nome e
        descrizione di una bottega altrui, la modifica si riflette subito sulla pagina pubblica
      - **`authorId` reso opzionale, admin crea bottege senza account collegato (2026-08-01)**:
        richiesta esplicita di Dario — l'admin raccoglie i dati da un titolare non ancora iscritto
        e crea la pagina lui stesso, senza dover prima far registrare quella persona. Migration
        `20260801150944_shop_optional_author`: `Shop.authorId`/`author` diventano opzionali
        (`String? @unique` — più righe con `authorId NULL` restano ammesse da Postgres, il vincolo
        "una bottega per utente" si applica solo a quelle collegate) e aggiunto `Shop.ownerName`
        (nome libero, usato per "Gestita da" finché non c'è un account collegato: la risoluzione è
        `shop.author?.name ?? shop.ownerName` in `app/botteghe/[slug]/page.tsx`, e il blocco
        "Gestita da" ora non renderizza affatto se sono entrambi assenti — capita solo su righe
        create prima di questa modifica senza mai passare dal form, quindi mai in pratica)
      - Nuova pagina `/admin/botteghe/new` (pulsante "+ Nuova bottega" nella lista), stesso
        `ShopForm` esteso con due campi visibili solo in "adminMode" (attivato passando la prop
        `assignableUsers`, non un booleano a parte): "Nome del gestore" (`ownerName`) e "Utente
        collegato" (`<select>` — `authorId`, parsato a parte da `parseLinkedAuthorId` in
        `app/admin/(dashboard)/botteghe/actions.ts`, non fa parte di `shopSchema`/
        `parseShopFormData` perché è una relazione, non un campo di contenuto). Validazione
        applicativa (non nello zod schema, solo lato action): serve almeno uno tra `ownerName` e
        utente collegato, altrimenti "Gestita da" non avrebbe nulla da mostrare
      - `lib/shops.ts` → `getAssignableUsers(currentAuthorId?)`: esclude chi ha già una bottega
        collegata (`authorId` è `@unique`, un utente ne gestisce al massimo una), tranne l'utente
        già collegato alla bottega che si sta modificando (altrimenti sparirebbe dalla select
        mentre la si guarda). Effetto pratico verificato: un utente già collegato non compare più
        tra le opzioni per una bottega *nuova* — la select stessa previene il doppio collegamento,
        non solo il controllo server-side (`Prisma.PrismaClientKnownRequestError` con
        `code === "P2002"` → messaggio dedicato, difesa in profondità per un eventuale bypass)
      - `/admin/botteghe` (lista) e la pagina di modifica mostrano un avviso quando manca un
        account collegato (`shop.ownerName ... (nessun account collegato)`, colore ambra) per
        rendere visibile a colpo d'occhio quali bottege vanno ancora collegate
      - Testato end-to-end con Playwright: validazione (nessun nome né utente → errore) →
        creazione con solo `ownerName` → non richiede alcun account → pagina pubblica mostra
        "Gestita da" col nome libero e iniziali come avatar → un iscritto vero si registra →
        admin lo collega dalla select → pagina pubblica passa a mostrare nome (e foto, se
        presente) dell'account reale → l'iscritto già collegato non compare più tra gli
        assegnabili per una bottega nuova. Dati di test ripuliti dal DB di produzione dopo la
        verifica (compreso un residuo di un test di una sessione precedente, notato per caso in
        uno screenshot e ripulito a parte)
- [x] **Header "scheda unica" nelle pagine di dettaglio community/botteghe/bacheca (2026-07-31)**:
      in `app/community/[slug]/page.tsx`, `app/botteghe/[slug]/page.tsx` e poi anche
      `app/news/[slug]/page.tsx` (stessa richiesta, estesa alla Bacheca) l'header (back-link,
      badge, titolo, autore/data) aveva `bg-cream-deep`/`border-b` e molto padding, leggibile come
      un blocco separato dal corpo sotto. Tolti sfondo e bordo, ridotto il padding (`pt-16 pb-2`
      sull'header, `pt-4 pb-12` sul corpo) così l'insieme si legge come un'unica scheda bianca — verificato
      visivamente su contenuti reali di produzione, desktop e mobile
- [x] **Pagina pubblica "Soci" (2026-08-02)**: `/soci` (`app/soci/page.tsx`, `lib/users.ts` →
      `getPublicMembers()`, `components/MemberCard.tsx`), elenco di tutti gli iscritti — nessun
      login richiesto per vederla, coerente con Bacheca/Community/Botteghe che sono già pubbliche.
      Aggiunta inizialmente al menù come link semplice, poi spostata tra le pillole colorate lo
      stesso giorno — vedi la voce sulla ristrutturazione del menù più sotto
      - **Scelta deliberata sulla privacy**: `getPublicMembers()` non seleziona affatto l'email
        (non solo "non mostrata a video" — proprio non arriva dal DB), scelta di design fatta
        proattivamente senza che fosse richiesto esplicitamente: chi vuole essere contattato
        pubblicamente mette i propri contatti sulla pagina Botteghe, che restano una scelta
        esplicita dell'iscritto, non un dato esposto di default registrandosi
      - Ogni card mostra avatar (`User.image`) o iniziali, nome, "socio dal" mese/anno
        (`createdAt`), e — se l'iscritto ha una bottega con `visibility: PUBLIC` — un link alla sua
        pagina. Il filtro su `visibility` è fatto nel componente (`components/MemberCard.tsx`), non
        nella query: con una relazione 1:1 opzionale non è pulito esprimere "includi la bottega solo
        se pubblica" direttamente in Prisma
      - **Refactor collaterale**: la funzione `initials()` (iniziali da un nome, per l'avatar
        segnaposto) esisteva già duplicata identica in `components/AccountForm.tsx` e
        `app/botteghe/[slug]/page.tsx` — con questa pagina sarebbe diventata una terza copia,
        quindi estratta in `lib/initials.ts` e i due usi esistenti aggiornati per importarla
      - **Trovati e ripuliti due account di test residui** durante la verifica: la nuova pagina
        rende visibile a chiunque *qualunque* `User` esista, comprese righe che prima non
        comparivano da nessuna parte nel sito pubblico. Uno era un residuo di questa stessa sessione
        (`test-avatar-…@example.com`, dai test della foto profilo del 2026-07-30), l'altro un
        residuo già documentato di una sessione precedente (`debug-…@example.com`, citato nella
        voce sul backfill di `emailVerified` del 2026-07-30) — nessuno dei due era mai stato
        ripulito perché fino a questa pagina non c'era modo di notarli pubblicamente. **Promemoria
        per il futuro**: da qui in avanti qualunque utente di test creato per verifiche va ripulito
        subito a fine sessione, perché ora è immediatamente visibile su `/soci` finché non lo si fa
      - **Nota lasciata aperta, non decisa qui**: l'account admin (`role: ADMIN`) compare nella
        lista come chiunque altro (nessun filtro per ruolo) — scelta non esplicitamente richiesta,
        segnalata a Dario ma non cambiata di default
      - Testato end-to-end con Playwright: la pagina carica contenuti reali di produzione, un
        iscritto con bottega pubblica mostra il link, un nuovo iscritto compare subito nell'elenco
        senza alcuna verifica/approvazione aggiuntiva e senza mostrare un link bottega (non ne ha
        una), iniziali mostrate quando manca una foto profilo. Dati di test ripuliti dopo la verifica
- [x] **Menù pubblico ristrutturato (2026-08-02)**: "Pagine" ora è Home, Il Borgo, Chi siamo,
      Bacheca, Contatti (Bacheca perde la pillola colorata, diventa un link semplice come le
      altre); "Partecipa" è Mercatino, Botteghe, Soci (tre pillole colorate). "Community" è stata
      **rinominata in "Mercatino"** solo nel menù/footer (`navLinks` in `lib/site-config.ts`) — la
      route resta `/community`, invariata, e così tutto il resto (titoli di pagina, admin, email):
      non richiesto di rinominare anche quelli, solo l'etichetta nel menù. "Soci" passa da link
      semplice a pillola colorata `sky` — riusa il colore lasciato libero da Bacheca invece di
      introdurne uno nuovo in palette (`sage`=Mercatino, `brick`=Botteghe erano già presi)
      - **Instagram in un gruppo "Social" a parte**: nella colonna "Partecipa" del menù, Instagram
        non è più l'ultima voce sotto le pillole ma un sotto-gruppo distinto con la propria
        etichetta eyebrow ("Social"), separato da un margine (`gap-6` sul contenitore della
        colonna invece di un unico `gap-5` piatto) — stessa colonna e stesso filo verticale color
        cielo di "Partecipa", solo raggruppamento interno diverso. Verificato visivamente desktop
        e mobile in `components/Header.tsx`
- [x] **QR code identificativo in `/community/account` (2026-08-03)**: `lib/qr.ts` →
      `signUserId()` (HMAC-SHA256 di `user.id` con secret `QR_SECRET`, nuova env var — generata
      con `crypto.randomBytes(32).toString("hex")`, mai committata) e `generateUserQrCode()` (usa
      il package `qrcode`, `QRCode.toDataURL()`, gira server-side in `app/community/account/page.tsx`
      dentro il Server Component esistente — nessuna route/action dedicata, nessuna nuova tabella:
      la stringa firmata si ricalcola al volo dall'id, non c'è nulla da persistere)
      - Formato del contenuto codificato: `"{userId}.{firmaHex}"`, esposto solo come immagine
        (`components/UserQrCode.tsx`, un `<img src={dataUrl}>` — nessuna interattività, quindi
        niente `"use client"`)
      - **Scope deliberatamente fermato alla sola generazione**, come richiesto esplicitamente:
        niente funzione di verifica del token, niente route che lo consumi. Aggiungerla ora
        sarebbe stato progettare per un requisito ipotetico non ancora arrivato — se in futuro
        serve una scansione/controllo, va scritta insieme a quella feature, riusando lo stesso
        `QR_SECRET` e lo stesso formato `userId.firma` (verifica: ricalcolare l'HMAC dall'userId e
        confrontarlo a tempo costante con `crypto.timingSafeEqual`, non con `===`, per non esporre
        un timing attack sulla firma)
      - Testato end-to-end con Playwright **decodificando davvero l'immagine PNG del QR** (non
        solo "un'immagine è apparsa"): `jsqr` + `pngjs` per leggere i pixel e decodificare il
        testo, poi confrontato byte-per-byte con `userId + "." + HMAC-SHA256(userId, QR_SECRET)`
        ricalcolato indipendentemente nel test. Verificato anche che sia deterministico (stesso
        risultato a un refresh) e diverso da utente a utente. Dati di test ripuliti dopo la verifica
- [x] **Voce di menù "Soci" rinominata in "Iscritti" (2026-08-15)**: stessa etichetta cambiata sia
      in `lib/site-config.ts` (`navLinks`) sia nel titolo effettivo della pagina (`app/soci/page.tsx`
      → `metadata.title` e `<h1>`, non solo il menù). Route invariata (resta `/soci`, stesso pattern
      già usato per "Community" → "Mercatino": rinominare l'etichetta non richiede rinominare anche
      URL/file/funzione). Non toccato apposta il resto del testo che usa "socio/soci" (es. "Socio dal
      ..." in `components/MemberCard.tsx`) — non richiesto, solo menù e titolo pagina
- [x] **Qualità foto hero "Il Borgo"/"Chi siamo" migliorata (2026-08-15)**: `lib/cloudinary-client.ts`
      → `withCloudinaryTransform(url, transformation)`, inserisce una trasformazione in un URL di
      consegna Cloudinary già completo (l'`<img src>` incollato nel contenuto HTML della pagina,
      salvato come `secure_url` intero via `RichTextEditor`, non come `public_id` — a differenza di
      `cloudinaryPreviewUrl()` che parte da un `public_id`), usato per chiedere `f_auto,q_auto:best`
      (formato/qualità migliori per browser) sull'immagine hero in `app/il-borgo/page.tsx` e
      `app/chi-siamo/page.tsx`
      - **Prima diagnosi sbagliata, corretta con le prove dell'inspector di Dario**: il primo
        tentativo (stessa sessione) partiva dall'ipotesi che l'`object-cover` a piena larghezza
        stirasse l'immagine oltre la sua risoluzione nativa (1920×1280, verificato via Cloudinary
        Admin API) sui monitor larghi, e aggiungeva solo `e_sharpen` per compensare — non ha
        risolto nulla. Dario ha poi controllato l'inspector del browser: "rendered size" 640×360
        contro "intrinsic size" 1920×1280 — l'immagine veniva **rimpicciolita** (downscale ~3×),
        non ingrandita: zero perdita di risoluzione, la causa era altrove
      - **Causa reale**: `className="scale-105 object-cover opacity-65 blur-[1px]"` più un
        overlay sfumato — un filtro di sfocatura reale (`blur-[1px]`) sommato a un'opacità ridotta
        (65%) sulla foto stessa, applicato deliberatamente in origine (probabilmente per leggibilità
        del testo sopra) ma percepito giustamente come "foto degradata". L'hero della home
        (`components/home/Hero.tsx`) usa invece il pattern corretto già in uso nel resto del sito:
        nessun blur, nessuna riduzione di opacità sull'immagine, solo un overlay sfumato scuro
        (`bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20`) per il contrasto del testo
      - **Fix**: rimossi `blur-[1px]`, `opacity-65` e `scale-105` (quest'ultimo esisteva solo per
        coprire gli artefatti ai bordi del blur, non più necessario) — resta solo `object-cover`.
        Overlay rinforzato da `from-ink/75 via-ink/30 to-ink/35` a `from-ink/85 via-ink/45 to-ink/40`
        per mantenere la leggibilità del testo (qui centrato verticalmente, non ancorato in basso
        come nella home) senza più il "crutch" della sfocatura/opacità sulla foto. Tolto anche
        `e_sharpen` dalla trasformazione Cloudinary (serviva solo a contrastare il blur CSS, ora
        assente — su una foto già nitida rischiava di risultare artificiale)
      - Verificato visivamente con screenshot locali (1400px, entrambe le pagine): foto nettamente
        più nitide, testo ancora leggibile sopra l'overlay rinforzato. Build/tsc/lint puliti
- [x] **Redesign pagina `/community/account` (2026-08-19)**: riorganizzata la pagina del profilo in tre tessere distinte in una griglia reattiva (1 colonna su mobile, 3 colonne su desktop):
      - **Dati personali** (form `AccountForm`)
      - **Tessera digitale** (codice QR `UserQrCode` ridisegnato per evitare doppi bordi e integrato con effetto card)
      - **Community / Partecipa**: i due link precedenti sono stati convertiti in pulsanti d'azione colorati (colore *sage* per il Mercatino e *brick* per la Bottega) corredati ciascuno da didascalie descrittive
      - La testata della pagina è stata uniformata a quella del Mercatino (sfondo `bg-cream-deep`) e accoglie il pulsante "Esci dall'account" in alto a destra
- [x] **Miglioramento layout `/soci` (2026-08-20)**: esteso il numero di colonne per la griglia degli iscritti da 3 a 4 a partire dal breakpoint desktop `lg` (`lg:grid-cols-4`)
- [x] **Redesign del footer (2026-08-20)**:
      - Suddiviso il menu di navigazione in due colonne distinte: **Pagine** (Home, Il Borgo, Chi siamo, Bacheca, Contatti) e **Partecipa** (Mercatino, Botteghe, Iscritti)
      - Rimosso il link di testo "Scrivici"
      - Inserita una sezione social dedicata a Instagram, evidenziata con l'icona del brand caricata da FontAwesome (`faInstagram`) sotto l'eyebrow "Social"
      - Rimosso il padding verticale superfluo tra l'indirizzo email e la via fisica
- [x] **Messa in evidenza annunci community (2026-08-20)**:
      - Aggiunto il campo `featured Boolean @default(false)` al modello `CommunityPost` ed eseguita la migrazione Postgres su Neon
      - Fornita la possibilità solo all'admin di evidenziare/rimuovere l'evidenza di un post pubblico dalla dashboard `/admin/community` tramite pulsanti a stella (`★ Evidenziato` / `☆ Evidenzia`) e relativi badge grafici, gestendo l'azione con mutua esclusione (massimo un post evidenziato alla volta)
      - Creata la sezione "In evidenza nella community" in fondo alla homepage pubblica (sopra il footer) che renderizza l'annuncio in evidenza tramite il nuovo componente `CommunityHighlight` (con stile *sage*, didascalie, autore, data e commenti), nascondendosi se non ci sono elementi in evidenza
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

(aggiornare questa checklist mano a mano, non lasciarla disallineata dal repo)

## Note per le sessioni future

- Prima di aggiungere una feature non prevista in PLANNING.md, aggiornare PLANNING.md invece di procedere e basta
- Se emergono decisioni sulle "Domande aperte" di PLANNING.md, riportarle qui e chiuderle nel planning doc
