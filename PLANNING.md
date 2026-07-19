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
- Login membri: email/password **+ Google OAuth**, stessa tabella `User` già pronta da Fase 1
- Campo `visibility` su `Post`/`Page` attivabile (`PUBLIC` → `PRIVATE`)
- Contenuti privati visibili solo a utenti autenticati (member area)

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
- Non implementate ancora: le route/pagine/admin per creare, moderare, commentare — solo lo schema
  Prisma (migrations `20260719145500_add_visibility_pending` e `20260719145041_add_community_bacheca`)

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

- Conferma: la form contatti serve davvero o basta mostrare l'email?
- Dominio finale: resta su terotero.it o passa a un dominio proprio? (influisce sulla verifica Resend)
- Chi, oltre a Dario, dovrà avere accesso admin al pannello?
