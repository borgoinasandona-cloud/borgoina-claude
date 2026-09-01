# Fase 6 — Token sconto via QR

- [x] **Fase 6 — Token sconto via QR (2026-08-26)**: chiude il cerchio aperto dalla Fase 5 (QR
      identificativo, generazione soltanto) — un gestore di bottega può ora scansionare il QR di un
      socio e assegnargli uno sconto concordato con l'admin. Nessun modello `Business`/ruolo
      `BUSINESS` nuovo: aggancio a `Shop`/`User` esistenti, come esplicitamente richiesto.
      **Attenzione al nome**: "Fase 2" nei documenti di progetto indica già una feature diversa e
      ancora aperta ("contenuti riservati", vedi la voce subito sotto) — questa è la Fase 6, dopo la
      Fase 5 di cui è il seguito naturale
      - Schema: due modelli nuovi, `DiscountToken` (shopId, discountPct, totalIssued, active) e
        `TokenRedemption` (tokenId, userId, usedAt) — migrazione `20260826085830_add_discount_tokens`.
        Nessun vincolo `@@unique` su `TokenRedemption`: **scelta esplicita**, un socio può riscattare
        più volte lo stesso token nella stessa bottega, l'unico limite reale è `totalIssued` (il
        totale, non per-utente)
      - **Race condition senza rete di sicurezza a DB**: senza un `@@unique` a bloccare i doppi
        inserimenti, il limite `totalIssued` deve essere garantito interamente in app. Un semplice
        recount (`count() < totalIssued` poi `create`) dentro una `$transaction` **non basta** sotto
        l'isolamento di default di Postgres (READ COMMITTED): due riscatti concorrenti sullo stesso
        token possono leggere lo stesso conteggio stantio e superare entrambi il limite. Risolto in
        `lib/discounts.ts` → `redeemToken()` con un row lock esplicito (`SELECT ... FOR UPDATE` via
        `tx.$queryRaw`, l'unico modo per ottenere un lock di riga con Prisma) sulla riga
        `DiscountToken` prima del conteggio: una seconda `redeemToken()` sullo stesso `tokenId` si
        mette in coda invece di leggere un conteggio non aggiornato. **Verificato con un test di
        concorrenza reale** (non solo "il codice non lancia errori"): `Promise.allSettled` di due
        `redeemToken()` simultanee su un token con `totalIssued: 1` → sempre esattamente 1 successo
        e 1 fallimento, mai 2 successi, mai 0
      - `lib/qr.ts` → aggiunta `verifySignedUserId(value)`: split `userId.firma`, ricalcola l'HMAC,
        confronto con `crypto.timingSafeEqual` (non `===`, per non esporre un timing attack sulla
        firma) — richiede buffer della stessa lunghezza, controllata prima per evitare un'eccezione
        su firme malformate/troncate invece di un `null` pulito
      - Admin: `/admin/botteghe/[id]/tokens` (non `/admin/shops/[slug]/tokens` come da bozza
        iniziale — corretto per seguire la convenzione di routing già in uso per le altre pagine
        admin botteghe, `[id]` non `[slug]`), lista token + form di creazione (percentuale 1-100,
        quantità), toggle attivo/disattivato. Riuso di `requireAdmin()` (stesso pattern di
        `app/admin/(dashboard)/botteghe/actions.ts`). Link "Sconti" aggiunto alla riga di ogni
        bottega in `/admin/botteghe`
      - **Badge "Non reclamata"**: in `/admin/botteghe` esisteva già un indicatore testuale ambra
        per le bottege senza `author` collegato (dalla Fase 4, "nessun account collegato") —
        aggiunto accanto un vero badge/pill "Non reclamata" (stesso stile dei badge
        `Pubblico`/`Nascosto` già in quella riga), stesso dato già in query, nessuna nuova query
      - `/scan` (route top-level, non sotto `/community`): `getShopByAuthorId(session.user.id)`
        (funzione già esistente in `lib/shops.ts`, riusata) → se `null`, redirect a `/community` —
        una bottega creata dall'admin ma non ancora reclamata (`authorId: null`) è esclusa
        strutturalmente, nessun utente può autenticarsi su di essa
      - `components/ScanClient.tsx` (client): lettura camera con **`html5-qrcode`** (nuova
        dipendenza — nessuna libreria QR-reader era già presente nel progetto). Flusso: scansione →
        `verifyAndListTokensAction` (verifica firma + nome socio + token attivi con posti residui) →
        tap su un token → `redeemTokenAction` → conferma a video con nome socio e percentuale.
        Riscatto rifiutato solo per "Posti esauriti" (mai un 500 grezzo), può capitare anche se il
        token risultava ancora disponibile un istante prima nella lista mostrata
      - **`playwright` rimosso per errore da `npm install html5-qrcode`**: non era mai stato un
        `devDependency` dichiarato in `package.json` (solo installato ad-hoc in una sessione
        precedente per i test E2E), quindi un normale `npm install <pkg>` lo ha rimosso come
        "extraneous" insieme al suo `-core`. Reinstallato con `npm install playwright --no-save`
        per non introdurlo come dipendenza dichiarata (resta ad-hoc/non versionato, come lo era
        prima) — **promemoria per il futuro**: qualunque `npm install` di un nuovo pacchetto in
        questo progetto rischia di far sparire di nuovo `playwright` da `node_modules`, va
        reinstallato allo stesso modo se serve testare con Playwright dopo
      - Testato end-to-end: script diretto (`tsx`) contro Prisma/Neon reali per `verifySignedUserId`
        (round-trip valido, firma alterata rifiutata) e `redeemToken` (capacità rispettata, nessun
        limite per-utente, shop-mismatch rifiutato, test di concorrenza — vedi sopra); Playwright
        per la UI: creazione bottega da admin → badge "Non reclamata" → creazione token da
        `/admin/botteghe/[id]/tokens` → toggle attivo/disattivato; controllo accessi `/scan` (utente
        senza bottega → redirect `/community`, utente con bottega → resta su `/scan`, container
        camera e nome bottega presenti). La scansione reale via camera **non è verificabile in
        automatico** (nessuna camera reale in ambiente headless) — da provare a mano su un device
        vero dopo il deploy. Dati di test (utenti, bottege, token) ripuliti dal DB di produzione
        dopo la verifica
- [x] **Badge sconti disponibili sul listino pubblico Botteghe (2026-08-26)**: `getPublicShops()`
      (`lib/shops.ts`) include ora i `DiscountToken` attivi di ogni bottega (con `_count` delle
      `redemptions`) e li riduce lato server a un unico campo `discountSlotsRemaining` (somma dei
      posti residui = `totalIssued - redemptions` per ogni token attivo, mai negativo) — la card
      pubblica non riceve né mostra i singoli token, solo il totale aggregato. Nuovo componente
      `components/DiscountBadge.tsx` (stesso pattern di `GalleryBadge.tsx`: pillola `font-mono`
      uppercase con icona FontAwesome, qui `faTag` da `free-solid-svg-icons` — non esiste in
      `free-regular-svg-icons`), colore `bg-brick` per distinguerlo dal pill categoria (`bg-ink/80`,
      in alto a sinistra) e dal badge Galleria (bianco/trasparente, in basso a destra): mostrato in
      `components/ShopCard.tsx` in alto a destra sulla cover, solo se `discountSlotsRemaining > 0`,
      testo singolare/plurale corretto ("1 sconto disponibile" / "N sconti disponibili"). Non
      toccata la pagina di dettaglio bottega (`/botteghe/[slug]`) — la richiesta era specifica sul
      listino ("schermata... delle botteghe")
      - Testato visivamente con due bottege di test (una con 7 posti totali e 2 già riscattati →
        badge corretto a "5 sconti disponibili", verificando che mostri il **residuo** e non il
        totale; una senza alcun token → nessun badge) — dati di test ripuliti dal DB di produzione
        dopo la verifica. Durante il test notato (non toccato, dato reale) che la bottega reale
        "TeroTero" ha già un token da 10 con 1 riscatto reale registrato, badge "9 sconti
        disponibili" corretto anche lì
- [x] **Pagina "Come funzionano gli sconti" (2026-08-26)**: `app/come-funzionano-gli-sconti/page.tsx`,
      pagina statica hardcoded (non un `Page` del CMS — è un contenuto una tantum, non gestito da
      admin) che spiega in due sezioni ("Per chi è socio" / "Per chi ha una bottega") come funziona
      il sistema token sconto della Fase 6. **Deliberatamente non linkata da nessuna parte del sito**
      (non in `navLinks`, non referenziata da altre pagine — verificato con grep) su richiesta
      esplicita: raggiungibile solo con l'URL diretto, pensata per essere condivisa a mano con le
      botteghe finché non si decide di collegarla dal menù
      - **Bug reale trovato e corretto durante la verifica**: in tre punti un testo dopo uno `</span>`
        perdeva lo spazio iniziale (es. "di Botteghe" + "le attività" → "Bottegele attività"), anche
        se nel sorgente JSX c'era un carattere spazio letterale prima della parola successiva sulla
        stessa riga. Causa: il testo continuava su più righe dopo lo span, e il compilatore SWC
        usato da Next.js/Turbopack (diversamente da Babel, che ha un caso speciale per la prima riga
        di un nodo di testo JSX) tronca lo spazio iniziale della prima riga di un nodo di testo
        multi-riga. Risolto sostituendo lo spazio letterale con `{" "}` esplicito nei tre punti
        interessati — stesso pattern già usato altrove nel progetto per casi simili. **Promemoria
        per il futuro**: quando del testo segue un elemento inline (`<span>`, `<Link>`, ecc.) e
        continua su più righe, usare sempre `{" "}` esplicito per lo spazio invece di contare su
        uno spazio letterale a inizio riga — non è affidabile con questo compilatore. Verificato
        leggendo il testo effettivamente renderizzato (non solo lo screenshot) prima e dopo il fix
      - **Hero fotografico aggiunto (2026-08-26)**: sostituito l'header piatto (`bg-cream-deep`) con
        un vero hero fotografico, stesso pattern di `/il-borgo`/`/chi-siamo` (foto full-bleed con
        overlay scuro sfumato, altezza 360px/460px, header trasparente sovrapposto — aggiunta la
        rotta a `HERO_IMAGE_PATHS` in `components/Header.tsx`). Foto fornita da Dario
        (`materiale/immagini-sito/webapp/comefunziona.jpg` — una mano che mostra la Tessera
        digitale/QR sullo smartphone su uno sfondo di via del Borgo), copiata in
        `public/images/come-funzionano-gli-sconti/` e servita come asset statico locale (non
        Cloudinary: pagina non gestita da CMS, stesso pattern già usato per l'hero della home in
        `components/home/Hero.tsx`, non il pattern Cloudinary delle pagine CMS-gestite)
- [x] **Sconti attivi in dettaglio nella pagina bottega (2026-08-26)**: a differenza del badge
      aggregato in `ShopCard.tsx` (solo un numero totale di posti residui), `/botteghe/[slug]`
      mostra ora un riquadro "Sconti disponibili" con **ogni token attivo elencato singolarmente**
      (percentuale + posti residui di quel token), riusando `getActiveTokensForShop()` già esistente
      in `lib/discounts.ts` (nessuna logica nuova, stessa funzione già usata da `/scan`) — chiamata
      con `shop.id` subito dopo `getShopBySlug()` in `app/botteghe/[slug]/page.tsx`. Sezione
      posizionata subito dopo i pulsanti WhatsApp/Chiama, prima di "Chi siamo" (alta visibilità),
      con una riga di istruzioni su come riscattarlo (mostrare il proprio QR). Non renderizzata
      affatto se non ci sono token attivi con posti residui (nessun riquadro vuoto)
      - Testato con dati reali di produzione: la bottega "TeroTero" (già con un token 20% da 10
        posti, 1 riscattato) mostra correttamente "20% di sconto — 9 posti disponibili"; una
        bottega senza alcun token attivo (Musicanova) non mostra la sezione, verificato leggendo il
        testo della pagina renderizzata (non solo uno screenshot)
- [x] **Blocco sconti in `/community/bottega` (2026-08-26)**: per il gestore di una bottega con
      almeno un `DiscountToken` (attivo o disattivato — riepilogo completo, non solo quelli
      attivi), aggiunto un riquadro (stesso stile brick/tag del riquadro sconti in
      `/botteghe/[slug]`) con un CTA ben in evidenza verso `/scan` e l'elenco di tutti i token della
      bottega (percentuale, badge "Disattivato" se non attivo, conteggio "N / M riscattati" via
      `_count.redemptions`). Riusa `getTokensForShopAdmin()` già esistente in `lib/discounts.ts`
      (nessuna nuova query — stesso nome "ForAdmin" della pagina admin token, ma la funzione non ha
      alcun controllo di ruolo al suo interno, il gestore la usa per vedere solo la propria
      bottega). Non renderizzato affatto se la bottega non ha ancora nessun token (nessun riquadro
      vuoto, nessun link a `/scan` per chi non ha ancora sconti da assegnare)
      - Testato con Playwright e dati reali: un iscritto con bottega + un token attivo (15%, 1
        riscatto su 20) e un token disattivato (30%) vede entrambi elencati correttamente col
        conteggio giusto e il link a `/scan`; un iscritto con bottega ma senza alcun token non vede
        il riquadro né il link. Dati di test ripuliti dal DB di produzione dopo la verifica
- [x] **Testi con "token" e terza card home sostituita (2026-08-26)**: aggiunto il termine "token"
      (accanto a "sconto") nei testi di `/come-funzionano-gli-sconti`, hero inclusa (eyebrow "Guida"
      → "Guida ai token sconto", troppo corta da sola). In home, la terza card di
      `components/home/VerdePopolare.tsx` ("Vita di vicinato", puramente illustrativa, nessun link)
      è stata sostituita con una card cliccabile verso `/come-funzionano-gli-sconti` — stessa foto
      `comefunziona.jpg` già usata per l'hero della guida, accento `bg-brick` invece di `bg-sage`
      per distinguerla dalle altre due (tema "verde", non pertinente qui). Le prime due card
      restano invariate, il titolo di sezione "Verde popolare" non è stato cambiato (richiesto solo
      di sostituire la terza card, non la sezione). **Aggiunto subito dopo un CTA testuale** ("Scopri
      come funziona →", colore brick, freccia che si sposta in hover) in fondo alla terza card, per
      differenziarla dalle prime due che restano blocchi puramente illustrativi senza CTA. **Le
      prime due card mantengono il riquadro bianco/bordo/ombra** (un primo tentativo di toglierlo
      del tutto è stato scartato), ma senza più alcun effetto hover (`group`, `hover:-translate-y-1`,
      `hover:border-ink/20`, `hover:shadow-xl`, zoom immagine e cambio colore titolo in hover
      rimossi) — non essendo cliccabili, non devono più dare l'impressione di esserlo. La terza
      card (link) resta l'unica con `group`/hover attivi. Verificato anche misurando la bounding
      box della prima card prima/dopo un hover simulato: identica, nessun sollevamento residuo.
      **Testi delle prime due card allungati** per bilanciare l'altezza con la terza (più alta per
      via della riga CTA in più) — verificato misurando l'altezza reale delle tre card via
      Playwright: 418px tutte e tre, identiche
- [x] **Fase 6 rivista: token/offerte generiche invece di sconti percentuali (2026-08-31)**: un
      `DiscountToken` non rappresenta più necessariamente una percentuale — è una campagna/offerta
      qualsiasi decisa di persona tra esercente e admin ("1 brioche gratis min 10€ di spesa",
      "vaso da fiori gratis", ecc.). Cambio non banale sullo schema: **prima di procedere, verificato
      lo stato di produzione** (come richiesto esplicitamente) invece di assumere che fosse vuoto —
      trovato **1 solo** `DiscountToken` reale (bottega "TeroTero", `discountPct: 20`, con **1
      riscatto reale già registrato**, lo stesso citato nella voce dell'8-26 sul badge "9 sconti
      disponibili" più sopra). Nessuna coppia `(tokenId, userId)` duplicata, quindi il nuovo
      `@@unique` non avrebbe comunque avuto righe da violare. Presentate a Dario tre opzioni per
      quell'unica riga (backfill automatico "Sconto 20%", placeholder da aggiornare a mano,
      eliminazione) — **scelta: eliminazione** (cascata sul suo `TokenRedemption`), eseguita prima
      della migration con uno script diretto mirato sul solo id di quella riga
      - Schema: `DiscountToken.discountPct Int` → `title String` (obbligatorio) + `description
        String? @db.Text` (opzionale). `TokenRedemption` riguadagna `@@unique([tokenId, userId])`
        — **capovolge la scelta esplicita della Fase 6 originale** ("un socio può riscattare più
        volte lo stesso token"): con ogni token ora una campagna specifica e limitata, un socio la
        riscatta una sola volta; per ripetere la stessa offerta l'admin crea un nuovo
        `DiscountToken`, non riusa quello vecchio. Migration
        `20260831073404_discount_token_generic_offer` creata a mano (`prisma migrate diff
        --from-schema-datasource ... --to-schema-datamodel ...` per generare l'SQL, poi
        `prisma migrate deploy` per applicarlo) perché `prisma migrate dev` rifiuta di girare in
        un ambiente non interattivo quando rileva un cambiamento che considera potenzialmente
        distruttivo (anche con `--create-only`) — **promemoria per il futuro**: per una migration
        che tocca colonne esistenti in questo ambiente, usare `migrate diff` + `migrate deploy`
        invece di `migrate dev`, che si blocca aspettando una conferma che qui non può arrivare
      - `lib/discounts.ts` → `redeemToken()`: il row lock su `totalIssued` resta invariato (limite
        totale, non per-utente — un problema diverso dal nuovo `@@unique`), ma la `create()` ora
        può fallire per violazione del vincolo — gestito con `Prisma.PrismaClientKnownRequestError`
        + `code === "P2002"` → messaggio dedicato "Questo socio ha già riscattato questa offerta."
        invece di un errore Prisma grezzo, stesso pattern già in uso altrove nel progetto per
        `Shop.authorId`. `getActiveTokensForShop()` guadagna un secondo parametro opzionale
        `excludeRedeemedByUserId`: usato solo da `/scan` (dove ha senso non riproporre al gestore
        un'offerta che quel socio specifico ha già usato — fallirebbe comunque per `@@unique`, ma è
        più chiaro non mostrarla affatto), non dalla pagina pubblica della bottega, che continua a
        mostrare tutte le offerte attive con posti residui indipendentemente da chi le ha già
        riscattate
      - UI aggiornata ovunque comparisse `discountPct` (verificato con `tsc`/grep, zero riferimenti
        residui): form admin (`TokenForm.tsx`, campo percentuale → `title` + `description` come
        textarea, dato `@db.Text`), lista admin token (`/admin/botteghe/[id]/tokens`), pagina
        pubblica bottega (`/botteghe/[slug]`, "Sconti disponibili" → "Offerte disponibili"), pagina
        bottega dell'iscritto (`/community/bottega`, "Sconti attivati" → "Offerte attivate"),
        `/scan` (`ScanClient.tsx`, lista post-scansione e conferma riscatto mostrano
        titolo+descrizione invece del badge percentuale). **Non toccata** deliberatamente
        `/come-funzionano-gli-sconti`: la pagina usa già linguaggio generico ("sconto", "token
        sconto") senza mai citare una percentuale specifica nel testo, quindi non era rotta dal
        cambio — solo imprecisa in alcuni punti, segnalato a Dario ma non riscritto senza richiesta
      - Testato end-to-end: fase UI con Playwright (campo percentuale assente dal form, titolo e
        descrizione visibili in admin/pagina pubblica/pagina iscritto, nessuna menzione di "% di
        sconto" residua) + fase diretta via script su `lib/discounts.ts` (secondo riscatto dello
        stesso utente sullo stesso token rifiutato con messaggio corretto senza riga duplicata nel
        DB; lista token esclude l'offerta per chi l'ha già riscattata ma non per un altro utente né
        per la pagina pubblica senza filtro; **test di concorrenza rieseguito** su `totalIssued` per
        confermare che il row lock funzioni ancora identico dopo il cambio schema — 1 successo e 1
        fallimento su due riscatti simultanei di utenti diversi, mai un doppio). Dati di test e la
        singola riga reale eliminata ripuliti dal DB di produzione dopo la verifica (0 righe
        `DiscountToken` residue a fine sessione, come atteso dopo l'eliminazione concordata)
      - **Bug reale trovato e corretto subito dopo (2026-08-31), segnalato da Dario**: nel form
        admin (`TokenForm.tsx`) il campo "Dettagli/condizioni" (una `<textarea>`) appariva
        spostato più in alto di ~9px rispetto a "Titolo offerta"/"Quantità" (due `<input>`),
        nonostante tutti e tre gli elementi si misurassero alla stessa identica altezza (34px) —
        un quirk del browser nel calcolare l'altezza intrinseca di una `<textarea>` dentro un
        contenitore `items-end`, diverso da quello di un `<input>`, verificato misurando le
        coordinate Y reali via Playwright (non solo a occhio) prima e dopo il fix. **Fix
        strutturale, non un aggiustamento a spanne**: contenitore del form passato da
        `items-end` a `items-stretch` (ogni cella del form ora alta quanto la riga intera, invece
        di dipendere dall'altezza intrinseca di ciascun tipo di controllo) + ogni div-campo
        diventa `flex flex-col justify-end` (allinea il proprio contenuto al fondo della propria
        cella, ora garantita uguale per tutti) — il bottone "+ Nuovo token", figlio diretto del
        form e non dentro un div-campo, ha bisogno di `self-end` esplicito per non stirarsi con
        il resto ora che il contenitore non è più `items-end` di default. Riverificato con
        Playwright: le tre coppie label+campo condividono ora esattamente le stesse coordinate Y
        (460.375 / 480.375 / 514.375), non solo la stessa altezza. Colto anche un residuo di
        terminologia non aggiornato nella revisione precedente: lo stato vuoto della lista diceva
        ancora "Nessun token sconto ancora creato" → "Nessuna offerta ancora creata". Dati di test
        ripuliti
      - **"posti disponibili" → "token disponibili" nella pagina pubblica bottega (2026-08-31)**:
        `app/botteghe/[slug]/page.tsx`, contatore accanto a ogni offerta nel riquadro "Offerte
        disponibili" — "token" resta invariato al plurale (prestito linguistico non declinato in
        italiano), solo "disponibile"/"disponibili" concorda col numero. Non toccato altrove (non
        richiesto): `/community/bottega` mostra "N / M riscattati", formulazione diversa, e la
        lista admin token in `/admin/botteghe/[id]/tokens` non ha mai usato "posti disponibili"
      - **"N sconti" → "N token" nel badge del listino Botteghe (2026-08-31)**:
        `components/DiscountBadge.tsx`, badge in alto a destra sulla card nella griglia
        `/botteghe` — semplificato anche il markup: "token" non si declina al plurale in
        italiano, quindi il ternario singolare/plurale (`"sconto"`/`"sconti"`) non serve più,
        resta solo il numero + "token" fisso
      - **Copy di `/come-funzionano-gli-sconti` e della card home aggiornati alla nuova gestione
        token (2026-08-31)**: testi scritti per il vecchio modello a percentuale/riscatti multipli
        non erano solo genericamente datati ma **contenevano due affermazioni ora false**, corrette
        in `app/come-funzionano-gli-sconti/page.tsx`: il paragrafo intro e lo step 2 lato socio
        parlavano genericamente di "sconto" invece di "offerta" (ora coerente col fatto che un
        token può essere un omaggio, una promozione, non solo una percentuale); più gravemente, lo
        step 3 lato socio affermava "puoi farlo ogni volta che torni, finché ci sono ancora posti
        disponibili per quello sconto" — falso dopo la reintroduzione di `@@unique([tokenId,
        userId])` del 2026-08-31 (un socio riscatta ogni campagna una sola volta), corretto in
        "Ogni offerta si riscatta una sola volta a testa — se l'attività la ripete in futuro, sarà
        un nuovo token da riscattare di nuovo"; e lo step 2 lato bottega mostrava un esempio con
        percentuale (`"20%, 10 token"`), sostituito con un esempio coerente col nuovo modello
        (`"Brioche gratis min 10€ di spesa, 10 token"`). Il primo punto elenco di "Un paio di cose
        da sapere" era il più sbagliato di tutti — affermava esplicitamente il comportamento
        opposto a quello reale (riscatti multipli concessi) — riscritto per dichiarare il limite
        corretto (una volta a persona) e come l'admin lo aggira (crea un nuovo token, non riusa
        quello vecchio). In `components/home/VerdePopolare.tsx`, la descrizione della terza card
        ("Token sconto nel Borgo") aggiornata da "Le Botteghe del Borgo offrono sconti ai soci"
        a "Le Botteghe del Borgo premiano i soci con offerte dedicate" — titolo della card e `alt`
        dell'immagine lasciati invariati (nome del feature, non contenuto da correggere). Non
        toccati deliberatamente: titolo `<title>`/URL/eyebrow/H1 della pagina guida (identità della
        pagina, non contenuto impreciso) e i due usi di "→" testuale come indicatore di percorso
        dentro una frase (non CTA, già documentato altrove nel non toccarli con le icone
        FontAwesome)
      - Verificato con Playwright contro un dev server già in esecuzione: nessuna occorrenza
        residua di "più volte in occasioni diverse" (vecchio claim, ora rimosso) né di `"20%,"`
        (vecchio esempio), presenza confermata di "una sola volta" e "Brioche gratis" nel testo
        effettivamente renderizzato (non solo nel sorgente). Le tre card di "Verde popolare" in
        home restano di altezza identica dopo la modifica del testo (444.1875px tutte e tre,
        misurate via bounding box) — nessuna rottura del bilanciamento fatto in una sessione
        precedente. `tsc`/`eslint` puliti. Screenshot verificati visivamente su entrambe le pagine,
        file temporanei ripuliti
      - **Parola "sconto" evitata/de-enfatizzata a favore di "token" nei titoli/card (2026-08-31,
        richiesta subito successiva)**: "sconto" resta accettabile solo come una tra le opzioni che
        un token può offrire (già così in due punti del corpo pagina — "sconti, omaggi, promozioni
        speciali" e "uno sconto, un omaggio, una promozione speciale" — non toccati, corretto
        lasciarli), ma non più come parola-titolo. Cambiati: `<title>`/H1 di
        `app/come-funzionano-gli-sconti/page.tsx` da "Come funzionano gli sconti" a **"Come
        funzionano i Token"** (richiesto esplicitamente), eyebrow da "Guida ai token sconto" a
        "Guida ai token"; card home in `components/home/VerdePopolare.tsx` da "Token sconto nel
        Borgo" a "Token del Borgo" (titolo e `alt` immagine); sottotitolo di `/scan`
        (`app/scan/page.tsx`) da "vedere gli sconti disponibili" a "vedere i token disponibili";
        `aria-label` dell'icona scorciatoia `/scan` in header da "Scansiona QR sconti" a "Scansiona
        QR token" (`components/Header.tsx`); link "Sconti" → "Token" nella riga di ogni bottega in
        `/admin/botteghe` (`app/admin/(dashboard)/botteghe/page.tsx`). **Deliberatamente non
        toccati**: la route/URL `/come-funzionano-gli-sconti` e il percorso immagine
        `/images/come-funzionano-gli-sconti/` (non richiesto rinominare URL/asset, solo i testi
        visibili), il nome funzione interno `ComeFunzionanoGliScontiPage` (identificatore, non
        testo utente), e i due punti del corpo pagina dove "sconto" è già usato correttamente come
        una delle opzioni elencate. Verificato con Playwright: `<title>` tab, H1 ed eyebrow del
        `<title>`/pagina guida corretti, titolo terza card home "Token del Borgo", le tre card
        restano di altezza identica (444.1875px) dopo il cambio testo. `tsc`/`eslint` puliti,
        screenshot verificati visivamente, file temporanei ripuliti
      - **Istruzioni della guida sostituite con riferimento alle icone header, non più a `/scan` o
        alla pagina account (2026-08-31, richiesta subito successiva)**: obiettivo esplicito —
        semplificare l'accesso mentale sia per il socio sia per il gestore, puntando alle due
        icone già presenti in `components/Header.tsx` (icona QR e icona fotocamera, aggiunte in
        una sessione precedente) invece che a un percorso di navigazione testuale. Modificato solo
        `app/come-funzionano-gli-sconti/page.tsx`: step 1 lato socio ("Apri il tuo QR personale")
        da "In Il mio account → Tessera digitale trovi un codice QR..." a "Tocca l'icona del QR in
        alto nell'header (accanto al tuo nome): si apre un codice che identifica solo te..."; step
        3 lato bottega (titolo da "3. Scansiona il QR del cliente da /scan" a "3. Scansiona il QR
        del cliente", corpo) da "apri /scan dal tuo telefono..." a "tocca l'icona della fotocamera
        in alto nell'header (visibile solo a chi ha una bottega collegata al proprio account),
        inquadra il codice..."; paragrafo introduttivo aggiornato di conseguenza ("basta il QR
        personale, sempre a portata di tocco dall'icona in alto nell'header" invece di "già
        presente nell'account di ogni iscritto"). Non toccati: step 2 lato socio (già rimanda al
        listino pubblico Botteghe, non a una pagina di scansione) e step 1/2 lato bottega
        (iscrizione e creazione token, nessun riferimento a `/scan` da rimuovere lì). Verificato
        con Playwright leggendo il testo effettivamente renderizzato: nessuna occorrenza residua
        di "/scan" o del vecchio percorso "Il mio account → Tessera digitale", presenza confermata
        di "icona del QR"/"icona della fotocamera"/"in alto nell'header". `tsc`/`eslint` puliti,
        screenshot verificato visivamente, file temporanei ripuliti
      - **Badge token nella card del listino Botteghe reso più evidente (2026-08-31)**:
        `components/DiscountBadge.tsx` — tolta l'icona (`faTag`), numero ingrandito
        (`text-2xl font-extrabold`, mai più di 2 cifre per costruzione — il conteggio residuo di
        una singola bottega non arriva mai a 3 cifre) e disposto in verticale sopra la scritta
        "TOKEN" (`flex flex-col items-center`, invece della riga orizzontale "N token" con icona).
        Nessuna modifica a `components/ShopCard.tsx` (badge già posizionato in alto a destra sulla
        cover, solo il contenuto interno è cambiato). Verificato visivamente su `/botteghe` con
        dati reali di produzione (bottega "TeroTero", badge "5" sopra "TOKEN" in alto a destra,
        nessuna icona), `tsc`/`eslint` puliti, file temporanei ripuliti
      - **Bordo sul badge e riepilogo token nel titolo "Offerte disponibili" (2026-08-31)**:
        `components/DiscountBadge.tsx` — aggiunto `border-2 border-cream` (`border: 2px solid
        var(--color-cream)`, stesso pattern già in uso nel progetto per l'avatar del gestore in
        questa stessa pagina). **Riusato lo stesso componente** nel dettaglio bottega
        (`app/botteghe/[slug]/page.tsx`): il testo "N token disponibile/i" accanto a ogni offerta
        nel riquadro "Offerte disponibili" è sostituito da `<DiscountBadge remaining={token.
        remaining} />`, stesso stile a due righe (numero grande sopra "TOKEN") già usato nella
        card del listino — coerenza visiva tra le due pagine. Il titolo del riquadro guadagna un
        riepilogo aggregato: "Offerte disponibili - (X di Y)", dove X è la somma dei `remaining` e
        Y la somma dei `totalIssued` di tutti i token attivi della bottega (non per singola
        offerta — un totale complessivo, calcolato con due `reduce()` sull'array già restituito da
        `getActiveTokensForShop()`, nessuna nuova query). Verificato con Playwright su dati reali
        di produzione (bottega "TeroTero", un solo token attivo 5/5 → titolo "Offerte disponibili
        - (5 di 5)", badge con bordo visibile sia in griglia sia nel dettaglio). `tsc`/`eslint`
        puliti, file temporanei ripuliti
