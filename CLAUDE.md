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

## Stato attuale

- [ ] Repo inizializzato
- [ ] Schema Prisma da PLANNING.md creato e migrato
- [ ] Setup Cloudinary
- [ ] Setup Resend + verifica dominio
- [ ] Auth admin (Credentials) funzionante
- [ ] Pagine statiche (Il Borgo, Chi Siamo, Contatti)
- [ ] CRUD Bacheca (post + categorie + immagini)
- [ ] Import contenuti dal sito attuale
- [ ] Form contatti → Resend
- [ ] Fase 2: Google OAuth + area riservata

(aggiornare questa checklist mano a mano, non lasciarla disallineata dal repo)

## Note per le sessioni future

- Prima di aggiungere una feature non prevista in PLANNING.md, aggiornare PLANNING.md invece di procedere e basta
- Se emergono decisioni sulle "Domande aperte" di PLANNING.md, riportarle qui e chiuderle nel planning doc
