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
npm run db:migrate
npm run db:seed
npm run dev
```

## Variabili d'ambiente

Vedi `.env.example` per l'elenco completo. Dopo aver compilato `DATABASE_URL`:

```bash
npm run db:migrate   # crea le tabelle
npm run db:seed      # crea l'utente admin (da ADMIN_EMAIL/ADMIN_PASSWORD) + categorie di base
```

## Deploy

- Repo collegato a Vercel, deploy automatico su push a `main`
- Le variabili d'ambiente vanno replicate nel progetto Vercel (Production + Preview)
- Il dominio del form contatti (Resend) deve essere verificato (SPF/DKIM) prima di andare live, altrimenti le email finiscono in spam o non partono

## Contenuti da migrare

Cartella asset fornita da Dario:
- `/materiale/loghi` — PNG trasparenti (+ SVG se disponibili)
- `/materiale/Immagini-sito` - Foto recuperate dal sito attuale (`npm run cloudinary:import` le carica tutte
  su Cloudinary e salva la mappatura path → public_id in `scripts/cloudinary-import-results.json`)
- Testi pagine statiche (Il Borgo, Chi Siamo, Contatti) e tutti gli articoli della Bacheca, con categoria e data
  — da fornire, non ancora presenti nel repo
