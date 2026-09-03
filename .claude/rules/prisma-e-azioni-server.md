---
paths:
  - "prisma/**"
  - "**/actions.ts"
  - "package.json"
---

# Prisma e azioni server

- `requireAdmin()`/`requireUser()` sono definiti **localmente in ogni file di action** (non un
  helper condiviso) — pattern voluto, coerente in tutto il progetto
- Vincoli `@@unique` violati: catturare `Prisma.PrismaClientKnownRequestError` con
  `code === "P2002"` e restituire un messaggio dedicato invece dell'errore Prisma grezzo
- Limiti di **capacità condivisa** sotto concorrenza (es. `totalIssued` di un `DiscountToken`): row
  lock esplicito (`SELECT ... FOR UPDATE` via `tx.$queryRaw` dentro `$transaction`) — un semplice
  recount non basta sotto l'isolamento di default Postgres (READ COMMITTED). Limiti **per-utente**
  invece: `@@unique` da solo è sufficiente, senza lock
- Ogni contenuto pubblico ha uno **slug leggibile** (mai un cuid nudo in URL): `Post`,
  `CommunityPost`, `Shop`, `Event`
- **`package.json` ha `postinstall: "prisma generate"`, non toglierlo**: senza, un deploy Vercel dopo
  una modifica a `schema.prisma` (con `package.json`/lockfile invariati) può riusare `node_modules`
  dalla cache con un Prisma Client stantio e fallire il build con errori di tipo su campi che esistono
  nello schema ma non nel client generato
- **`prisma migrate dev`** (anche con `--create-only`) rifiuta di girare non-interattivo quando
  rileva un cambiamento "distruttivo": per una migration che tocca colonne esistenti in questo
  ambiente, usare `prisma migrate diff --from-schema-datasource <schema> --to-schema-datamodel
  <schema> --script` per generare l'SQL, creare a mano la cartella in `prisma/migrations/`, poi
  `prisma migrate deploy` per applicarla (nessun prompt interattivo)
