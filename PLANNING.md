# Planning — Borgo INA San Donà

## Obiettivo

Ricostruire borgoinasandona.terotero.it (attualmente su CMS terzo) come sito Next.js con CMS proprio,
riusando lo stack già collaudato da Dario (Next.js, Prisma/Postgres, Vercel, Cloudinary).

## Contenuto del sito attuale (riferimento)

- **Home**: hero, sezione intro comitato, 3 blocchi "Verde popolare" (immagine+titolo+testo),
  sezione "Il Borgo utile" (evidenza news), sezione "Iniziative", preview ultimi 4 post della Bacheca, footer con contatti
- **Il Borgo** — pagina statica
- **Chi siamo** — pagina statica
- **Bacheca** (`/news`) — listino articoli con categorie (es. "Eventi", "Feste"), cover image, data, estratto + corpo, a volte link esterno (es. galleria Google Photos)
- **Contatti** — indirizzo, email, social
- Footer: indirizzo comitato, email, link Instagram

## Assunzioni / decisioni prese

- **Niente multilingua** (il sito attuale ha IT/EN, la nuova versione è solo IT)
- **Nessun redirect** dagli URL vecchi
- **Foto**: si riparte da quelle presenti sul sito attuale. Nota: i link pubblici sono versioni ridimensionate
  (`/media/images/resize/...`); vale la pena, in fase di import, provare anche varianti di path senza `resize/`
  per vedere se esistono originali a risoluzione più alta prima di caricarle su Cloudinary
- **Loghi**: forniti a parte in PNG trasparente (+ SVG se disponibili)
- **Contatti**: si assume una form di contatto sulla pagina Contatti che invia via Resend a `CONTACT_EMAIL_TO`,
  oltre a mostrare indirizzo/email/social statici — da confermare con Dario se non voluta
- **Admin**: un solo account admin (email di Dario) in MVP, ma lo schema utenti è pensato fin da subito per
  supportare più ruoli e provider di login, per non dover rifare tutto in Fase 2

## Fasi

### Fase 1 — MVP
- Pagine statiche (Il Borgo, Chi Siamo, Contatti) gestibili da admin
- Bacheca: CRUD articoli con categorie, cover, galleria immagini, tutto pubblico
- Login admin singolo (email, via Credentials)
- Form contatti → Resend
- Immagini su Cloudinary

### Fase 2 — contenuti riservati
- [x] Login membri: email/password **+ Google OAuth** (aggiunto il 2026-07-20, session strategy
      `jwt` — vedi CLAUDE.md), stessa tabella `User` già pronta da Fase 1
- [x] Verifica email obbligatoria alla registrazione (link di attivazione) + recupero password via
      email, aggiunti il 2026-07-30 — vedi CLAUDE.md
- [ ] Campo `visibility` su `Post`/`Page` attivabile (`PUBLIC` → `PRIVATE`)
- [ ] Contenuti privati visibili solo a utenti autenticati (member area)

### Fase 3 — bacheca community (non prevista nel planning originale, aggiunta il 2026-07-19)
- **Bacheca news (`Post`) resta invariata**, gestita solo dall'admin — nessuna modifica al modello
- Nuova bacheca separata (`CommunityPost`) dove gli iscritti pubblicano due tipi di contenuto:
  oggetti (regalo/prestito/cerco/vendo, `type` in `GIFT`/`LOAN`/`REQUEST`/`SALE`) e
  segnalazioni/eventi (`type` in `ISSUE`/`ANNOUNCEMENT`)
- Moderazione: ogni `CommunityPost` nasce con `visibility: PENDING` (nuovo valore sull'enum
  `Visibility` condiviso con `Post`/`Page`) e va approvato dall'admin (`PENDING` → `PUBLIC`) prima
  di comparire pubblicamente — le query pubbliche filtrano già per `visibility: "PUBLIC"` in modo
  stretto, quindi `PENDING` resta escluso senza bisogno di modifiche a `lib/posts.ts`
- `status` (`AVAILABLE`/`PENDING`/`CLOSED`) traccia lo stato pratico di un oggetto (es. riservato,
  concluso) — rilevante soprattutto per i `type` oggetto, opzionale per segnalazioni/eventi
- Commenti (`Comment`, collegati solo a `CommunityPost`, non a `Post`): la regola è che sui post di
  tipo oggetto i commenti sono visibili solo tra autore del post e autore del commento — il campo
  `CommunityPost.visibilityOfComments` (`PUBLIC`/`AUTHOR_ONLY`) è il meccanismo con cui questa
  regola viene applicata (impostato dall'app in base al `type` alla creazione, non forzato a DB
  level), l'enforcement effettivo di chi vede cosa resta un compito della query/app, non dello schema
- **Implementata end-to-end il 2026-07-19**: registrazione/login soci (`/community/register`,
  `/community/login`, riusa il Credentials provider esistente — anticipa un pezzo minimo di Fase 2,
  senza Google OAuth né verifica email), listino/dettaglio/creazione annunci pubblici, moderazione
  admin (`/admin/community`), commenti con la regola di visibilità applicata in
  `lib/community.ts` → `filterVisibleComments()`. Dettagli, limiti noti (approssimazione della
  privacy dei commenti senza threading) e un bug di sessione trovato/corretto durante il testing:
  vedi CLAUDE.md

### Fase 4 — Botteghe (non prevista nel planning originale, aggiunta il 2026-07-31)
- Ogni iscritto può creare **una pagina di presentazione** della propria attività/bottega (modello
  `Shop`, `authorId` `@unique` → relazione 1:1), separata da `CommunityPost`: nome, categoria
  (`ShopCategory`: artigianato/negozio/ristorazione/servizi/altro), copertina, galleria
  (`ShopImage`), sezione **"Chi siamo"** (slogan, descrizione e servizi, storia, perché sceglierci)
  e sezione **"Contatti"** (indirizzo, telefono/WhatsApp, email, sito, Instagram, orari). Sulla
  pagina pubblica, se c'è un telefono compaiono i pulsanti "Scrivimi su WhatsApp" e "Chiama ora"
- **Nessuna moderazione preventiva**: la pagina è pubblica non appena l'iscritto la crea
  (`visibility: PUBLIC` di default). L'admin può comunque nascondere/ripubblicare o eliminare da
  `/admin/botteghe` un contenuto inappropriato a posteriori (deciso così dopo una prima versione
  con moderazione admin, poi tolta il 2026-07-31 — vedi CLAUDE.md)
- Sulla pagina pubblica della bottega è **in evidenza chi è l'iscritto collegato** (avatar/iniziali
  + nome, sezione "Gestita da"): la logica è che chi si iscrive alla community può poi avere anche
  una pagina della propria attività, e la pagina resta sempre visibilmente legata a quella persona
- **Implementata end-to-end il 2026-07-31**: gestione personale in `/community/bottega`
  (crea/modifica/elimina la propria pagina, `components/ShopForm.tsx`), listino pubblico con
  filtro categoria e dettaglio in `/botteghe` e `/botteghe/[slug]`, gestione admin in
  `/admin/botteghe`. Testato end-to-end con Playwright (creazione → subito pubblica e visibile nel
  listino senza alcun intervento admin → autore in evidenza sulla pagina → admin nasconde/
  ripubblica → eliminazione), dati di test ripuliti dal DB di produzione dopo la verifica. Dettagli
  implementativi: vedi CLAUDE.md
- **L'admin può creare una bottega per conto di un titolare non ancora iscritto (2026-08-01)**:
  `/admin/botteghe/new`, con un nome del gestore (`ownerName`) al posto di un account. Quando quel
  titolare si registra, l'admin collega la bottega al suo account da `/admin/botteghe/[id]/edit`
  scegliendolo da un elenco — a quel punto "Gestita da" passa a mostrare nome e foto del profilo
  reale. `authorId` è quindi diventato opzionale (era obbligatorio). Dettagli: vedi CLAUDE.md
- **Pagina pubblica "Soci" (2026-08-02)**: elenco di tutti gli iscritti in `/soci` (nome, avatar o
  iniziali, "socio dal" mese/anno di iscrizione, link alla propria bottega se ne ha una pubblica).
  Nessuna email mostrata (dato sensibile, non serve per una directory pubblica). Dettagli: vedi
  CLAUDE.md

### Fase 5 — QR code identificativo (non prevista nel planning originale, aggiunta il 2026-08-03)
- In `/community/account` ogni iscritto vede un proprio QR code identificativo (nome utente + firma
  HMAC-SHA256, generato server-side, secret in `QR_SECRET`). Nessuna nuova tabella: la firma si
  ricalcola al volo dall'`id` esistente, non c'è nulla da salvare. Non ancora usato per verificare
  nulla (nessuna route di scansione/controllo) — solo la generazione, come richiesto. Dettagli e
  scelte di scope: vedi CLAUDE.md

### Fase 6 — Token sconto (non prevista nel planning originale, aggiunta il 2026-08-26)
- Chiude il cerchio aperto dalla Fase 5: il QR identificativo ora serve a qualcosa. Un gestore di
  `Shop` può scansionare il QR di un socio e assegnargli uno sconto concordato con l'admin
  (percentuale + quantità totale disponibile, decisi caso per caso in base all'accordo commerciale)
- Nessun modello `Business` separato e nessun ruolo `BUSINESS`: tutto si aggancia a `Shop`/`User`
  già esistenti (un utente "è un'attività" se e solo se ha una `Shop` collegata, come già per la
  Fase 4)
- Due nuovi modelli: `DiscountToken` (uno sconto definito dall'admin per una bottega, con quantità
  totale e stato attivo/disattivato) e `TokenRedemption` (un riscatto effettivo, socio + token +
  timestamp). **Nessun limite di riscatti per singolo socio** su uno stesso token, per scelta
  esplicita — solo la quantità totale (`totalIssued`) è vincolante, garantita con un row lock
  (`SELECT ... FOR UPDATE`) invece che con un vincolo `@@unique`, perché un semplice recount dentro
  una transazione non basterebbe sotto scansioni concorrenti (isolamento di default Postgres,
  READ COMMITTED). Dettagli: vedi CLAUDE.md
- `lib/qr.ts` si arricchisce di `verifySignedUserId()` (verifica della firma con
  `crypto.timingSafeEqual`, a tempo costante) — la generazione (Fase 5) resta invariata
- Solo l'ADMIN crea/gestisce i `DiscountToken` di una bottega, da `/admin/botteghe/[id]/tokens`
  (nessuna pagina self-service per le attività sulla definizione degli sconti)
- Il gestore della bottega riscatta i token per i propri clienti da `/scan` (lettore camera,
  libreria `html5-qrcode`): accessibile solo a chi ha una `Shop` collegata al proprio account,
  redirect a `/community` altrimenti — nessuna pagina di scansione per l'admin o per bottege non
  reclamate (per definizione non hanno un `authorId`, quindi nessuno può autenticarsi su di esse)
- Badge "Non reclamata" in `/admin/botteghe` per le bottege senza `authorId` collegato, per
  individuare a colpo d'occhio quali attività non possono ancora usare `/scan`

## Data model (bozza Prisma)

```prisma
enum Role {
  ADMIN
  MEMBER
}

enum Visibility {
  PUBLIC
  PRIVATE
  PENDING   // in attesa di moderazione — usato dalla community, non dalla bacheca news admin
}

enum CommunityPostType {
  GIFT          // regalo
  LOAN          // prestito
  REQUEST       // cerco
  SALE          // vendo
  ISSUE         // segnalazione
  ANNOUNCEMENT  // evento/avviso
}

enum CommunityPostStatus {
  AVAILABLE
  PENDING
  CLOSED
}

enum CommentVisibility {
  PUBLIC
  AUTHOR_ONLY
}

model User {
  id             String          @id @default(cuid())
  email          String          @unique
  password       String?         // hash bcrypt, null se solo OAuth
  name           String?
  role           Role            @default(MEMBER)
  accounts       Account[]
  sessions       Session[]
  communityPosts CommunityPost[]
  comments       Comment[]
  createdAt      DateTime        @default(now())
}

// Account / Session / VerificationToken: modelli standard richiesti da Auth.js
// per supportare provider OAuth (Google) accanto a Credentials

model Page {
  id        String   @id @default(cuid())
  slug      String   @unique   // "il-borgo" | "chi-siamo" | "contatti"
  title     String
  content   String   @db.Text   // HTML (editor WYSIWYG, non Markdown — vedi CLAUDE.md)
  updatedAt DateTime @updatedAt
}

model Post {
  id           String      @id @default(cuid())
  slug         String      @unique
  title        String
  excerpt      String?
  content      String      @db.Text   // HTML (editor WYSIWYG, non Markdown)
  coverImage   String?     // Cloudinary public_id
  externalLink String?     // es. link galleria Google Photos
  publishedAt  DateTime?
  featured     Boolean     @default(false)   // se true, evidenziato in home al posto del più recente
  visibility   Visibility  @default(PUBLIC)
  categories   Category[]
  images       PostImage[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

// Bacheca della community: iscritti pubblicano oggetti (regalo/prestito/cerco/vendo)
// e segnalazioni/eventi, separata dalla bacheca news (Post) gestita solo dall'admin.
model CommunityPost {
  id                   String               @id @default(cuid())
  slug                 String               @unique
  title                String
  content              String               @db.Text   // HTML (editor WYSIWYG)
  coverImage           String?              // Cloudinary public_id
  authorId             String
  author               User                 @relation(fields: [authorId], references: [id], onDelete: Cascade)
  type                 CommunityPostType
  status               CommunityPostStatus?
  visibility           Visibility           @default(PENDING)
  visibilityOfComments CommentVisibility    @default(PUBLIC)
  comments             Comment[]
  featured             Boolean              @default(false)
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt
}

model Comment {
  id              String        @id @default(cuid())
  communityPostId String
  communityPost   CommunityPost @relation(fields: [communityPostId], references: [id], onDelete: Cascade)
  authorId        String
  author          User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content         String        @db.Text
  createdAt       DateTime      @default(now())
}

model Category {
  id    String @id @default(cuid())
  name  String @unique   // "Eventi", "Feste"
  slug  String @unique
  posts Post[]
}

model PostImage {
  id     String @id @default(cuid())
  postId String
  post   Post   @relation(fields: [postId], references: [id])
  url    String // Cloudinary
  alt    String?
  order  Int    @default(0)
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String   @db.Text
  createdAt DateTime @default(now())
}
```

## Domande aperte (da chiudere prima o durante lo sviluppo)

- [x] **Form contatti: chiusa, implementata e live** — c'è, invia via Resend, salva anche su
      `ContactMessage` come fallback (vedi CLAUDE.md)
- [x] **Dominio finale: chiuso il 2026-07-27** — passato a un dominio proprio, `borgoinasandona.it`
      (acquistato da Dario), non più un sottodominio di terotero.it. Il vecchio
      `borgoinasandona.terotero.it` reindirizza al nuovo dominio. Il dominio è stato verificato
      anche su Resend per l'invio email (vedi CLAUDE.md)
- Chi, oltre a Dario, dovrà avere accesso admin al pannello?
