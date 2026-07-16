# Borgo INA San Donà — sito + CMS

Rifacimento del sito civico del quartiere Borgo INA (San Donà di Piave) con stack Next.js.
Sostituisce l'attuale installazione su terotero.it, mantenendo lo stesso contenuto ma con CMS proprio.

## Stack

- **Next.js** (App Router) + React
- **PostgreSQL + Prisma** come DB/ORM
- **Vercel** per hosting/deploy
- **Cloudinary** per immagini (loghi, cover articoli, gallerie)
- **Resend** per invio email (form contatti, in Fase 2 anche reset password / notifiche login)
- **Auth.js (NextAuth v5)** per login admin e, in Fase 2, login membri (Credentials + Google OAuth)

Nessuna gestione multilingua, nessun redirect da URL legacy: si riparte pulito.

Per lo scope dettagliato, il data model e le fasi vedi **PLANNING.md**.
Per le convenzioni di lavoro e lo stato corrente vedi **CLAUDE.md**.

## Setup locale

```bash
npm install
cp .env.example .env
# compilare le variabili (vedi sotto)
npx prisma migrate dev
npm run dev
```

## Variabili d'ambiente

```
DATABASE_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
CONTACT_EMAIL_TO=borgoinasandona@gmail.com

AUTH_SECRET=
ADMIN_EMAIL=

# Fase 2 (Google OAuth) — non ancora necessarie in MVP
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Deploy

- Repo collegato a Vercel, deploy automatico su push a `main`
- Le variabili d'ambiente vanno replicate nel progetto Vercel (Production + Preview)
- Il dominio del form contatti (Resend) deve essere verificato (SPF/DKIM) prima di andare live, altrimenti le email finiscono in spam o non partono

## Contenuti da migrare

Cartella asset fornita da Dario:
- `/loghi` — PNG trasparenti (+ SVG se disponibili)
- Foto: recuperate dal sito attuale (vedi PLANNING.md per la nota sulla risoluzione)
- Testi pagine statiche (Il Borgo, Chi Siamo, Contatti) e tutti gli articoli della Bacheca, con categoria e data
