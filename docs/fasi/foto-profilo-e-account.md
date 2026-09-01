# Foto profilo e pagina account

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
- [x] **Redesign pagina `/community/account` (2026-08-19)**: riorganizzata la pagina del profilo in tre tessere distinte in una griglia reattiva (1 colonna su mobile, 3 colonne su desktop):
      - **Dati personali** (form `AccountForm`)
      - **Tessera digitale** (codice QR `UserQrCode` ridisegnato per evitare doppi bordi e integrato con effetto card)
      - **Community / Partecipa**: i due link precedenti sono stati convertiti in pulsanti d'azione colorati (colore *sage* per il Mercatino e *brick* per la Bottega) corredati ciascuno da didascalie descrittive
      - La testata della pagina è stata uniformata a quella del Mercatino (sfondo `bg-cream-deep`) e accoglie il pulsante "Esci dall'account" in alto a destra
