# Notifiche email admin

- [x] **Email di notifica admin su nuovi iscritti/annunci/botteghe (2026-08-21)**:
      `lib/users.ts` → `getAdminEmails()` (query `User` con `role: "ADMIN"`, non un env var statico —
      in produzione ci sono già 2 account ADMIN). `lib/resend.ts` → helper interno
      `sendAdminNotification(subject, text)` (salta l'invio se non ci sono admin) più tre funzioni
      pubbliche: `sendNewMemberNotification`, `sendNewCommunityPostNotification`,
      `sendNewShopNotification`. Collegate in coda a: `app/community/register/actions.ts`
      (`registerAction`, dopo la creazione utente), `app/community/new/actions.ts`
      (`createCommunityPostAction`, ogni post nasce già `visibility: PENDING`), `app/community/bottega/actions.ts`
      (`saveShopAction`, **solo nel ramo `else` di creazione**, non quando un iscritto modifica una
      bottega già esistente — l'admin non va notificato ad ogni modifica)
      - Ogni chiamata è avvolta in un `try/catch` con `console.error` (stesso pattern già usato in
        `app/contatti/actions.ts` per `sendContactEmail`): un fallimento dell'invio non deve mai
        bloccare la registrazione/pubblicazione/creazione dell'utente, che restano l'azione
        primaria — la notifica admin è un side-effect informativo
      - Testato end-to-end con Playwright contro un dev server locale riavviato di fresco (il
        processo precedente aveva un Prisma Client stantio, non rigenerato dopo l'ultima migration
        — bug preesistente non legato a questa feature, risolto incidentalmente con `npx prisma
        generate` + restart, non ha mai riguardato l'ambiente Vercel che rigenera sempre il client
        in build): registrazione → verifica email via token letto dal DB → login → creazione
        annuncio Mercatino → creazione bottega. Con un log temporaneo (poi rimosso) verificato che
        tutte e tre le chiamate a Resend siano state accettate con un id reale e `error: null`,
        inviate a entrambi gli indirizzi admin in produzione. Dati di test (utente + annuncio +
        bottega, cascata su `onDelete: Cascade`) ripuliti dal DB di produzione dopo la verifica
      - **Bug reale trovato e corretto: iscrizioni via Google non notificavano l'admin
        (2026-08-29, segnalato da Dario)**: `sendNewMemberNotification` era collegata solo a
        `registerAction` (`app/community/register/actions.ts`), il flusso di registrazione
        Credentials — chi si iscrive con Google non passa mai da lì: `@auth/prisma-adapter` crea
        l'utente da solo al primo login OAuth, senza toccare quel file. Il test end-to-end del
        2026-08-21 sopra copriva solo "registrazione → verifica email via token" (Credentials),
        quindi il buco non era mai stato notato. Corretto agganciando `sendNewMemberNotification`
        a `events.createUser` nella configurazione NextAuth (`lib/auth.ts`, non
        `lib/auth.config.ts` — quest'ultimo resta "edge-safe" per il proxy/middleware, niente
        chiamate Resend/Prisma lì) — l'hook ufficiale di Auth.js che scatta solo quando è
        l'*adapter* a creare l'utente, quindi solo per OAuth: la registrazione Credentials crea
        l'utente direttamente con `prisma.user.create()`, mai tramite l'adapter, zero rischio di
        doppio invio per lo stesso utente. Stesso `try/catch` con `console.error` del resto delle
        notifiche admin — un fallimento dell'invio non deve mai bloccare il login
      - **Verifica parziale**: `tsc`/`next build` puliti. **Non verificabile da qui**: il vero
        comportamento di `events.createUser` richiede un login Google reale (redirect OAuth con
        consenso su accounts.google.com), non riproducibile in Playwright/headless senza
        credenziali Google reali — da confermare con un primo accesso Google reale dopo il deploy
        (un account che non ha mai fatto login sul sito prima, altrimenti l'utente esiste già e
        l'evento non scatta)
      - **Bug reale confermato in produzione (segnalato da Dario)**: il login Google creava
        davvero l'utente (sessione valida, riga in DB) ma il sito mostrava comunque la pagina
        generica di Auth.js "Server error — There is a problem with the server configuration.".
        Non riproducibile qui (serve un vero handshake OAuth con Google), ma la causa è stata
        individuata leggendo direttamente il sorgente di `@auth/core` invece di ipotizzare:
        `node_modules/@auth/core/lib/actions/callback/handle-login.js` chiama
        `await events.createUser?.({ user })` **in linea** dentro il flusso di login OAuth, dopo
        che l'utente è già stato creato dall'adapter ma prima di creare la sessione — qualunque
        eccezione non catturata lì esce dall'handler e fa fallire l'intera richiesta;
        `node_modules/@auth/core/index.js` intercetta poi qualsiasi errore non riconosciuto come
        "client-safe" nella pipeline e lo trasforma nel generico tipo `"Configuration"`,
        indipendentemente da cosa l'abbia causato — da cui il messaggio "check the server logs"
        (letterale: `logger.error(error)` sul server, mai il dettaglio al client). L'handler
        aveva già un `try/catch` attorno alla sola chiamata a `sendNewMemberNotification`, che a
        rigore di semantica JS dovrebbe già intercettare sia throw sincroni sia rejection —
        indagine statica non ha trovato un varco preciso, ma è l'unico codice toccato di recente
        su questo percorso (confermato con `git log -- lib/auth.ts`, un solo commit). **Corretto
        per difesa in profondità**: l'intero corpo dell'handler (non solo la chiamata a Resend) è
        ora dentro il `try`, così qualunque eccezione futura in quel blocco — non solo quelle
        già previste — non può più propagarsi e far fallire il login. Verificato che il pattern
        try/catch sia realmente a prova di eccezioni con uno script diretto che forza
        `sendNewMemberNotification` a fallire (`RESEND_API_KEY` invalida) e conferma che
        nessun errore esce dall'handler; verificato anche che il login Credentials non abbia
        subito regressioni (stesso file condiviso). **Da confermare a fondo**: un vero login
        Google su un account nuovo dopo il deploy, dato che il vero trigger non è riproducibile
        da qui
