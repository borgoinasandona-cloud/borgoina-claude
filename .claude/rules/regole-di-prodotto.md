# Regole di prodotto

- **Niente i18n/multilingua** — non introdurre next-intl o routing `/it` `/en`
- **Niente redirect da URL legacy** — non serve mappare i vecchi permalink
- Admin in Fase 1 è **un solo utente** (email di Dario), ma il modello `User` va scritto fin da subito
  con `role` ed `Account`/`Session` di Auth.js, pensando alla Fase 2 (membri con login email/password + Google)
- Il campo `visibility` su `Post`/`Page` esiste da subito ma resta `PUBLIC` ovunque finché non si apre la Fase 2

## Note operative

- **`npm install` di un pacchetto nuovo** può rimuovere `playwright` da `node_modules` (non è mai
  stato un `devDependency` dichiarato, solo installato ad-hoc per i test E2E) — reinstallare con
  `npm install playwright --no-save` se serve testare dopo
