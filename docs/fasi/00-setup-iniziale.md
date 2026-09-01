# Setup iniziale del progetto

- [x] Repo inizializzato
- [x] Schema Prisma da PLANNING.md creato (Account/Session/VerificationToken aggiunti per Auth.js),
      **migrato su Neon** (`DATABASE_URL` in `.env`, migrazione `20260716153602_init` applicata).
      Aggiunto anche `Post.featured Boolean @default(false)` (migrazione `20260718104149_add_post_featured`,
      non prevista nel bozza originale di PLANNING.md — vedi sezione "In evidenza" più sotto)
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
