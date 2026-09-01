# Fase 5 — QR identificativo

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
