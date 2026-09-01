# Login Google e verifica email / recupero password

- [x] Login Google (Auth.js v5 + `@auth/prisma-adapter`, aggiunto il 2026-07-20):
      - Modelli `User`/`Account`/`Session`/`VerificationToken` erano già nello schema nel formato
        richiesto dall'adapter fin dallo scaffold iniziale — nessuna migration necessaria
      - **Session strategy resta `jwt`, non `database`**: Auth.js non supporta il Credentials
        provider con sessioni `database` (limitazione intenzionale, documentata — vedi
        https://authjs.dev/concepts/session-strategies). Passare a `database` avrebbe rotto il
        login sia admin sia soci esistenti; `jwt` funziona perfettamente anche con provider OAuth
      - `GoogleProvider` in `lib/auth.ts` con `clientId`/`clientSecret` passati esplicitamente da
        `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (nomi storici del progetto, non gli
        `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` che Auth.js v5 inferirebbe automaticamente)
      - Nuovo utente Google → `role: MEMBER` di default (schema, invariato); nessun modo per
        ottenere `ADMIN` via OAuth, resta assegnabile solo a mano/seed
      - `allowDangerousEmailAccountLinking` **non** impostato (resta `false`, il default sicuro di
        Auth.js): se un'email ha già un account Credentials, un login Google con la stessa email
        viene rifiutato (`OAuthAccountNotLinked`) invece di collegarsi automaticamente — scelta
        deliberata per non fidarsi ciecamente del match email senza una decisione esplicita
      - Pulsante "Continua con Google" su `/community/login` e `/community/register`
        (`components/GoogleSignInButton.tsx`, azione `signInWithGoogleAction`)
      - Header pubblico ora riceve la sessione da `app/layout.tsx` (Server Component, `await auth()`)
        e la passa come prop a `Header` (Client Component): mostra "Accedi" da sloggati, nome
        utente (+ avatar dal 2026-07-30) da loggati — il logout si fa da `/community/account`, non
        dal menu, da quando "Esci" è stato tolto dal menu (vedi commit `4c0a33d`, precedente a
        questa sessione). **Effetto collaterale**: il layout root ora legge i cookie ad ogni richiesta, quindi tutte
        le pagine sono diventate `ƒ` (dynamic) invece di poter restare `○` (static) — inevitabile
        per un header che mostra lo stato di login
      - Verificato in locale e in produzione: redirect a `accounts.google.com` con `client_id`/
        `redirect_uri`/`scope` corretti; nessuna regressione su login admin e login/registrazione
        community Credentials esistenti
      - **Due bug reali trovati e corretti dopo il deploy, testando il login Google dal vivo**:
        1. `redirect_uri_mismatch` — il progetto OAuth su Google Cloud Console non aveva
           l'URI di callback autorizzato; risolto da Dario lato Google Cloud Console (non nel
           codice), aggiungendo sia `https://borgoina-claude.vercel.app/api/auth/callback/google`
           sia quello del dominio custom `https://borgoinasandona.terotero.it/api/auth/callback/google`
        2. Dopo il consenso Google, la callback falliva con l'errore generico
           `/api/auth/error?error=Configuration` ("Server error... check the server logs") — causa
           reale: il modello `User` non aveva i campi `emailVerified`/`image` richiesti dallo
           schema Prisma di riferimento di Auth.js (https://authjs.dev/getting-started/adapters/prisma).
           `@auth/prisma-adapter`'s `createUser` passa l'intero oggetto `AdapterUser` (incluso
           `emailVerified: null`) direttamente a `prisma.user.create()`: con quei campi assenti
           dallo schema, Prisma rifiutava l'insert e Auth.js mascherava l'errore reale con la
           pagina generica "Configuration" (il messaggio "check the server logs" è letterale — il
           dettaglio non arriva mai al client per motivi di sicurezza). Diagnosticato leggendo
           direttamente `node_modules/@auth/prisma-adapter/index.js` e confrontando con lo schema
           Prisma ufficiale di Auth.js, poi confermato riproducendo la stessa chiamata
           (`prisma.user.create({ data: { email, emailVerified: null, name, image } })`) prima e
           dopo la migration. Risolto aggiungendo `emailVerified DateTime?` e `image String?` a
           `User` (migrazione `20260721090930_add_user_emailverified_image`, additiva, nessun
           rischio per i dati esistenti) — **se in futuro si integra un altro provider OAuth,
           controllare sempre lo schema `User` contro il riferimento Prisma ufficiale di Auth.js,
           non solo Account/Session/VerificationToken**
      - **Migrazione dominio (2026-07-27)**: aggiunto `https://borgoinasandona.it/api/auth/callback/google`
        ai redirect URI autorizzati su Google Cloud Console (da Dario); verificato che il login
        Google funzioni sul nuovo dominio (redirect a `accounts.google.com` con `redirect_uri`
        corretto)
- [x] **Verifica email + recupero password (2026-07-30)**:
      - Riusa la tabella standard `VerificationToken` di Auth.js (mai toccata dal provider
        Credentials) per entrambi i flussi: token esadecimale casuale con prefisso `ev_`
        (verifica email, scadenza 24h) o `pr_` (reset password, scadenza 1h) — vedi `lib/tokens.ts`.
        Nessuna migration necessaria, il modello esisteva già dallo scaffold Auth.js
      - Registrazione (`app/community/register/actions.ts`): non fa più auto-login. Crea l'utente
        con `emailVerified: null`, invia un'email con link `/community/verify-email?token=...`
        (`lib/resend.ts` → `sendVerificationEmail`) e mostra un messaggio "controlla la tua email"
      - Il gate vero e proprio è in `lib/auth.ts` → `authorize()`: se `user.emailVerified` è
        `null` lancia `EmailNotVerifiedError` (sottoclasse di `CredentialsSignin` con
        `code: "email-not-verified"`), letta poi in `communityLoginAction`/`loginAction` per
        mostrare un messaggio dedicato invece del generico "credenziali non valide", con un
        pulsante "Rinvia email di conferma" (`components/ResendVerificationForm.tsx`,
        `app/community/verify-email/actions.ts`). **Il gate riguarda solo il provider
        Credentials**: gli utenti Google passano dal flusso OAuth (che non chiama mai
        `authorize()`), quindi non ne sono toccati
      - Recupero password: `/community/forgot-password` → `/community/reset-password?token=...`
        (`lib/resend.ts` → `sendPasswordResetEmail`). Risposta sempre identica indipendentemente
        dal fatto che l'email esista o meno, per non rivelare quali indirizzi sono registrati.
        Cliccare un link di reset valido marca anche `emailVerified` se non lo era già (prova
        equivalente di possesso della casella), poi fa auto-login con la nuova password
      - Link "Password dimenticata?" aggiunto anche su `/admin/login`: stesso flusso, stessa
        tabella `User` — niente sistema separato per l'admin
      - **Backfill obbligatorio prima del deploy**: senza toccare i dati esistenti, il gate
        avrebbe bloccato all'istante ogni account Credentials già esistente (admin incluso, dato
        che il seed non ha mai valorizzato `emailVerified`). Risolto con uno script una tantum
        (`npx tsx`, poi cancellato) che marca `emailVerified = now()` per tutti gli utenti con
        `password IS NOT NULL AND emailVerified IS NULL` **prima** del push — eseguito il
        2026-07-30 sul DB di produzione (3 account: i due admin + un utente di test residuo)
      - Caso limite gestito: un account nato solo con Google (`password: null`) che imposta una
        password da `/community/account` non aveva mai ricevuto un link di verifica — senza
        correzione sarebbe rimasto bloccato al primo login Credentials. `updateAccountAction` ora
        marca anche `emailVerified` in quel momento (vedi commento in
        `app/community/account/actions.ts`)
      - Nuova env var **`NEXT_PUBLIC_SITE_URL`** (base per i link assoluti nelle email): impostata
        da Dario su Vercel Production a `https://borgoinasandona.it` il 2026-07-30 (in locale
        resta `http://localhost:3000`, vedi `.env.example`)
      - Testato end-to-end in locale con Playwright contro un utente reale creato via UI
        (registrazione → login bloccato → rinvio conferma → verifica via token letto dal DB →
        login riuscito → token riusato rifiutato → token falso rifiutato → recupero password →
        nuova password funzionante, vecchia rifiutata → token di reset falso rifiutato), dati di
        test ripuliti dal DB subito dopo
