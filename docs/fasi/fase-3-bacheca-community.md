# Fase 3 — Bacheca community

- [x] Schema Prisma: bacheca community (`CommunityPost`, `Comment`, enum `CommunityPostType`/
      `CommunityPostStatus`/`CommentVisibility`, `Visibility.PENDING`) — vedi PLANNING.md "Fase 3".
      Migrato su Neon in due migration separate (`20260719145500_add_visibility_pending` poi
      `20260719145041_add_community_bacheca`): Postgres non permette di usare un nuovo valore enum
      come `DEFAULT` di colonna nella stessa transazione in cui viene aggiunto (errore `55P04`) —
      se in futuro serve aggiungere un altro valore a un enum esistente E usarlo subito in una
      colonna/tabella nuova, va sempre spezzato in due migration
- [x] Bacheca community — implementata end-to-end (schema + UI):
      - Registrazione/login soci: `/community/register`, `/community/login` (Credentials, ruolo
        `MEMBER`, stesso meccanismo di login dell'admin — vedi `lib/auth.ts`). Login Google
        aggiunto il 2026-07-20 (vedi voce dedicata più sotto). Verifica email obbligatoria per
        Credentials aggiunta il 2026-07-30 (vedi voce dedicata più sotto)
      - Pubblicazione annunci (`/community/new`, richiede login) e listino/dettaglio pubblici
        (`/community`, `/community/[slug]`), con filtro per tipo e cover image opzionale (upload
        Cloudinary via `/api/upload/sign`, ora aperto a qualunque utente loggato e non più solo ADMIN)
      - Ogni annuncio nasce `visibility: PENDING`; moderazione admin in `/admin/community`
        (Approva → `PUBLIC`, Rifiuta → `PRIVATE`, Elimina). L'autore vede il proprio annuncio anche
        da `PENDING`/`PRIVATE` con un banner di stato; chiunque altro riceve 404 finché non è `PUBLIC`
      - L'autore può aggiornare lo `status` (disponibile/in sospeso/chiuso) ed eliminare il proprio
        annuncio da `/community/[slug]`
      - Commenti: chiunque sia loggato può commentare; la regola "sui post di tipo oggetto i commenti
        sono visibili solo tra autore e chi commenta" è implementata in
        `lib/community.ts` → `filterVisibleComments()` — **approssimazione nota**: non essendoci un
        campo di threading nello schema (nessun `parentId`), un utente che ha già commentato vede
        anche tutti i commenti scritti dall'autore ad altri commentatori (non i commenti altrui,
        solo le risposte dell'autore) — non è un vero isolamento per-thread, va tenuto a mente se in
        futuro serve una privacy più stretta
      - **Bug reale trovato e corretto durante il testing E2E**: `lib/auth.config.ts` → callback
        `session` impostava `session.user.role` ma non `session.user.id` (restava `undefined` pur
        con `session.user` troncato/definito) — passava inosservato ovunque nel codice si controllasse
        solo `if (!session?.user)`, ma rompeva in silenzio qualunque check più specifico su
        `session.user.id` (es. la creazione di un post community, che sembrava fallire "a caso" con
        un redirect al login). Corretto copiando `token.sub` in `session.user.id`; il tipo `Session`
        in `types/next-auth.d.ts` ora dichiara `id: string` come obbligatorio (non più opzionale via
        `DefaultSession`) proprio per intercettare in futuro regressioni di questo tipo a compile-time
      - Testato end-to-end con Playwright (registrazione → post PENDING → nascosto al pubblico →
        approvazione admin → visibile → regola commenti verificata con 3 utenti reali), dati di
        test ripuliti dal DB di produzione dopo la verifica
      - Pagina account soci (`/community/account`): l'iscritto modifica nome/email/password
        (ogni modifica richiede la password attuale per conferma, verificata con `bcrypt.compare`)
        e fa logout. Link "Il mio account" visibile su `/community` solo se loggato. **Nota**: la
        sessione usa strategy JWT — se un socio cambia nome/email, il cookie di sessione resta con
        i valori vecchi finché non rifà login (la pagina account stessa e tutte le query pubbliche
        leggono sempre nome/email freschi da Prisma via `session.user.id`, mai dal token, quindi
        non c'è disallineamento visibile — ma va tenuto a mente se in futuro si legge
        `session.user.name`/`session.user.email` altrove)
      - **Bug reale trovato e corretto il 2026-07-21**: chi si era registrato solo con Google
        (`User.password` = `null`) non poteva salvare NESSUNA modifica su `/community/account`,
        perché il form chiedeva sempre la password attuale per confermare — password che un
        account solo-OAuth non ha mai avuto. La pagina ora calcola `hasPassword` lato server
        (`!!user.password`) e lo passa al form: se `false`, il campo "Password attuale" resta
        nascosto e la action salta del tutto quel controllo (l'identità è già garantita dalla
        sessione OAuth); se l'utente vuole può comunque impostare una password per poter accedere
        anche via Credentials in futuro. Corretto anche un bug collaterale scoperto testando
        questo fix: `formData.get("currentPassword")` restituisce `null` (non `undefined`) quando
        il campo non è nel DOM, e lo schema Zod (`z.string().optional().or(z.literal(""))`)
        accetta `undefined`/`""` ma non `null` — falliva con un generico "Invalid input" anche a
        campo correttamente nascosto. Risolto normalizzando a `formData.get(...) || ""` come già
        si faceva per `newPassword`
      - Categorie ristrutturate il 2026-07-20: Oggetti (Regalo/Vendo/Presto) e Servizi e lavori
        (Offro/Chiedo) — rimossa la categoria Segnalazioni/eventi (quel contenuto vive nella
        bacheca news). Aggiunto valore enum `SERVICE_OFFER`; `ISSUE`/`ANNOUNCEMENT` restano
        nell'enum Postgres ma non sono più selezionabili. Corretta anche una cronologia di
        migration fuori ordine (vedi commit `91949a9`)
- [x] **Messa in evidenza annunci community (2026-08-20)**:
      - Aggiunto il campo `featured Boolean @default(false)` al modello `CommunityPost` ed eseguita la migrazione Postgres su Neon
      - Fornita la possibilità solo all'admin di evidenziare/rimuovere l'evidenza di un post pubblico dalla dashboard `/admin/community` tramite pulsanti a stella (`★ Evidenziato` / `☆ Evidenzia`) e relativi badge grafici, gestendo l'azione con mutua esclusione (massimo un post evidenziato alla volta)
      - Creata la sezione "In evidenza nella community" in fondo alla homepage pubblica (sopra il footer) che renderizza l'annuncio in evidenza tramite il nuovo componente `CommunityHighlight` (con stile *sage*, didascalie, autore, data e commenti), nascondendosi se non ci sono elementi in evidenza
