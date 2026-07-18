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

## Data model (bozza Prisma)

```prisma
enum Role {
  ADMIN
  MEMBER
}

enum Visibility {
  PUBLIC
  PRIVATE
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String?   // hash bcrypt, null se solo OAuth
  name      String?
  role      Role      @default(MEMBER)
  accounts  Account[]
  sessions  Session[]
  createdAt DateTime  @default(now())
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
