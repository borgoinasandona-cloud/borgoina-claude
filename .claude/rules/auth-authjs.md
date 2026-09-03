---
paths:
  - "lib/auth.ts"
  - "lib/auth.config.ts"
  - "app/community/**"
---

# Auth.js

- `events.createUser` di Auth.js scatta solo per utenti creati dall'**adapter** (flusso OAuth): la
  registrazione Credentials crea l'utente direttamente con `prisma.user.create()` e notifica a
  parte — nessun rischio di doppio invio per lo stesso utente
