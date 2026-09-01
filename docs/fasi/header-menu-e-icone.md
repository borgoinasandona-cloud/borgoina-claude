# Header, menu e icone

- [x] **Header/menù ridisegnati (2026-07-30/31)**: hamburger sempre visibile a tutti i breakpoint
      (prima solo sotto `md`) invece della nav desktop — apre lo stesso modale a tutta larghezza,
      ora su 2 colonne (Home/Il Borgo/Chi siamo/Contatti/Botteghe a sinistra, Bacheca/Community/
      Instagram con pillole colorate a destra, filo verticale color cielo a dividerle), voci in
      font display (Big Shoulders) invece del mono maiuscolo piccolo, focus da tastiera visibile.
      "Accedi" è ora una pillola piena `rounded-full` color brick (CTA vera, distinta dagli altri
      bottoni squadrati del sito); l'account già loggato (avatar+nome) resta un link semplice.
      Font Awesome (stile regular, `lib/fontawesome.ts`) adottato come famiglia di icone al posto
      di emoji/SVG custom: commento (`f075`), immagine/galleria, hamburger/chiudi (solo in solid,
      non esistono in regular) e Instagram (solo nel set brands) — restano emoji solo negli editor
      admin (`RichTextEditor.tsx`, `PostForm.tsx`), non toccati. Footer: aggiunto "credits: TeroTero"
      (link a terotero.it) accanto al copyright
- [x] **Header "scheda unica" nelle pagine di dettaglio community/botteghe/bacheca (2026-07-31)**:
      in `app/community/[slug]/page.tsx`, `app/botteghe/[slug]/page.tsx` e poi anche
      `app/news/[slug]/page.tsx` (stessa richiesta, estesa alla Bacheca) l'header (back-link,
      badge, titolo, autore/data) aveva `bg-cream-deep`/`border-b` e molto padding, leggibile come
      un blocco separato dal corpo sotto. Tolti sfondo e bordo, ridotto il padding (`pt-16 pb-2`
      sull'header, `pt-4 pb-12` sul corpo) così l'insieme si legge come un'unica scheda bianca — verificato
      visivamente su contenuti reali di produzione, desktop e mobile
- [x] **Menù pubblico ristrutturato (2026-08-02)**: "Pagine" ora è Home, Il Borgo, Chi siamo,
      Bacheca, Contatti (Bacheca perde la pillola colorata, diventa un link semplice come le
      altre); "Partecipa" è Mercatino, Botteghe, Soci (tre pillole colorate). "Community" è stata
      **rinominata in "Mercatino"** solo nel menù/footer (`navLinks` in `lib/site-config.ts`) — la
      route resta `/community`, invariata, e così tutto il resto (titoli di pagina, admin, email):
      non richiesto di rinominare anche quelli, solo l'etichetta nel menù. "Soci" passa da link
      semplice a pillola colorata `sky` — riusa il colore lasciato libero da Bacheca invece di
      introdurne uno nuovo in palette (`sage`=Mercatino, `brick`=Botteghe erano già presi)
      - **Instagram in un gruppo "Social" a parte**: nella colonna "Partecipa" del menù, Instagram
        non è più l'ultima voce sotto le pillole ma un sotto-gruppo distinto con la propria
        etichetta eyebrow ("Social"), separato da un margine (`gap-6` sul contenitore della
        colonna invece di un unico `gap-5` piatto) — stessa colonna e stesso filo verticale color
        cielo di "Partecipa", solo raggruppamento interno diverso. Verificato visivamente desktop
        e mobile in `components/Header.tsx`
- [x] **Redesign del footer (2026-08-20)**:
      - Suddiviso il menu di navigazione in due colonne distinte: **Pagine** (Home, Il Borgo, Chi siamo, Bacheca, Contatti) e **Partecipa** (Mercatino, Botteghe, Iscritti)
      - Rimosso il link di testo "Scrivici"
      - Inserita una sezione social dedicata a Instagram, evidenziata con l'icona del brand caricata da FontAwesome (`faInstagram`) sotto l'eyebrow "Social"
      - Rimosso il padding verticale superfluo tra l'indirizzo email e la via fisica
- [x] **Avatar sempre presente accanto al nome in header, con iniziali di fallback (2026-08-27)**:
      in `components/Header.tsx`, il link "Il mio account" accanto all'hamburger mostrava l'avatar
      solo se `session.user.image` era valorizzato — altrimenti solo il nome, senza alcun
      segnaposto. Aggiunto il fallback iniziali (`initials()` da `lib/initials.ts`, stesso helper
      già usato in `MemberCard`/`AccountForm`/pagina bottega) in un cerchietto `bg-cream text-ink`:
      colore fisso indipendente dallo stato dell'header (trasparente su hero foto vs solido)
      per restare leggibile in entrambi i casi, a differenza di un `bg-ink/10` come in `MemberCard`
      (lì il contesto è sempre uno sfondo bianco di card, qui no). Verificato con Playwright e
      utenti di test reali nei tre casi: senza foto su header solido, senza foto su header
      trasparente (hero fotografica in home), con foto — tutti corretti. Dati di test ripuliti
- [x] **Icona QR in header, apre il proprio QR in una modale (2026-08-27)**: a sinistra del blocco
      avatar+nome (da loggati), nuova icona `faQrcode` che apre una modale centrata con lo stesso
      `components/UserQrCode.tsx` già usato in `/community/account` (nessun componente nuovo per il
      contenuto, solo il contenitore modale). Il QR va generato server-side (usa `crypto`/
      `QR_SECRET`, non può girare nel client component `Header.tsx`): `app/layout.tsx` ora chiama
      `generateUserQrCode(session.user.id)` una volta per richiesta (già faceva `auth()` per la
      sessione, nessuna query DB aggiuntiva: la firma si ricalcola al volo dall'id, come da
      Fase 5) e lo passa a `Header` come prop `qrCodeDataUrl`, invece di fare una chiamata separata
      dal client — costo trascurabile (HMAC + encode QR, nessun I/O) anche calcolato ad ogni
      pagina per un utente che magari non apre mai la modale
      - Stesso pattern di portale (`createPortal` su `document.body`) già usato per il menu mobile,
        stato `qrModalOpen` indipendente da `mobileOpen` (i due non si aprono mai insieme). Chiusura
        su: pulsante X (riusa `CloseIcon` da `components/MenuIcons.tsx`), click sul backdrop, o
        cambio pagina (stesso pattern "adjust state during render" già usato per chiudere il menu
        mobile alla navigazione). `inert` sul contenitore quando chiuso, blocco scroll body condiviso
        con `mobileOpen` nello stesso `useEffect`
      - **Bug di metodologia nel primo giro di test, non un bug applicativo**: `page.locator(...).
        isVisible()` di Playwright non considera `opacity-0` come "non visibile" (solo
        `display:none`/`visibility:hidden`/dimensione zero) — il primo test segnalava la modale
        "visibile" anche a riposo. Corretto usando l'opacità effettiva calcolata
        (`getComputedStyle` risalendo gli antenati) invece di `isVisible()`: con la verifica giusta,
        0 a riposo, 1 da aperta, 0 dopo ogni chiusura, come atteso
      - Testato con Playwright e utenti reali: icona presente da loggati, apertura/chiusura (X e
        backdrop) corrette, QR renderizzato come data URL PNG valido, stabile per lo stesso utente
        tra due aperture, diverso tra due utenti diversi (verifica indiretta di unicità senza dover
        decodificare i pixel del QR). Dati di test ripuliti dal DB di produzione dopo la verifica
- [x] **Nome utente nascosto in header sotto `sm` (2026-08-27)**: da loggati, sotto i 640px resta
      visibile solo l'avatar/iniziali nel link account (per risparmiare spazio in mobile) — il nome
      è in uno `<span className="hidden sm:inline">`, non rimosso dal DOM ma escluso
      dall'accessibility tree quando nascosto. Per non perdere il nome accessibile su mobile (il
      link avrebbe altrimenti nessun testo accessibile con una foto profilo, alt="" sull'immagine),
      aggiunto `aria-label={session.user.name || "Account"}` direttamente sul `<Link>`, sempre
      presente indipendentemente dal breakpoint. Verificato con Playwright (display effettivo dello
      span nome: nascosto sotto 640px, visibile a 1400px; `aria-label` presente in entrambi i casi)
      e screenshot mobile/desktop. Dati di test ripuliti
- [x] **Aree cliccabili ingrandite in header mobile (2026-08-27)**: icona QR e hamburger avevano
      un'area di tocco pari alla sola icona (~20-28px), sotto il minimo consigliato (~44px).
      Icone portate a `h-6 w-6`/`h-8 w-8` e aggiunta la tecnica margine-negativo/padding
      (`-m-2 p-2`) per allargare l'area cliccabile senza spostare il layout visibile (il padding
      aggiunto è compensato dal margine negativo uguale e contrario, quindi il `gap-4` del
      contenitore flex resta invariato). Avatar/iniziali ingranditi da `h-6 w-6` a `h-8 w-8`
      (dimensione visibile, non solo l'area di tocco: è un elemento identitario, non una pura
      icona). Verificato misurando i bounding box reali via Playwright: QR e hamburger ora 37×44px,
      avatar 32×32px — click funzionale confermato su tutti e tre (apre la modale QR, apre il menu
      mobile). Dati di test ripuliti
- [x] **Bug scoperto e corretto: tutte le classi Tailwind `h-*`/`w-*` sulle icone Font Awesome del
      sito pubblico venivano ignorate dal browser (2026-08-27)**: partendo dalla richiesta di
      ingrandire anche il *glyph* (non solo l'area di tocco) di icona QR e hamburger in mobile
      header, portando le classi a `h-9 w-9` (36px) la dimensione renderizzata non cambiava
      affatto — misurato via Playwright, sempre ~21×17px indipendentemente dalla classe applicata.
      **Causa reale**: `node_modules/@fortawesome/fontawesome-svg-core/styles.css` (importato una
      volta per side-effect in `lib/fontawesome.ts`) definisce `.svg-inline--fa { height: 1em;
      width: var(--fa-width, 1.25em); }` come CSS "unlayered" (fuori da `@layer`) — la stessa
      classe di bug già documentata in questo file per `.eyebrow`/`body`: una regola non-layered
      batte **sempre** le utility Tailwind di `@layer utilities`, indipendentemente dall'ordine nel
      markup. Il bug era presente fin dalla prima icona Font Awesome introdotta in questa sessione
      (frecce, tag, camera, qrcode, commento, ecc.) ma non era mai stato notato: alle dimensioni
      piccole tipiche (14–19px, vicine a 1em/1.25em del font body a 17px) il risultato "sbagliato"
      sembrava plausibile a occhio — è diventato evidente solo ora, chiedendo una dimensione molto
      più grande (36px) e misurandola con Playwright invece di verificarla solo visivamente
      - **Primo tentativo, abbandonato**: un override centralizzato in `app/globals.css` con
        `.svg-inline--fa { height: revert-layer; width: revert-layer; }`. Si è rivelato inaffidabile:
        anche dopo un riavvio pulito del dev server, l'elemento aveva **tre** regole
        `.svg-inline--fa` in cascata (originale Font Awesome → il mio `revert-layer` → un'altra copia
        della regola originale, apparentemente da una duplicazione della stessa stylesheet nel
        bundle di sviluppo) — la terza regola, arrivata dopo, vinceva di nuovo per ordine sorgente e
        annullava l'override. Troppo fragile per essere affidabile, rimosso
      - **Bug collaterale mentre si scriveva il commento esplicativo per quel tentativo**: la
        sottostringa letterale `*/` dentro il testo di un commento CSS (scritta come scorciatoia
        per riferirsi insieme a pattern `h-*` e `w-*`) chiude il commento in anticipo e corrompe il
        parsing di tutto il CSS successivo — scoperto solo con l'errore reale di `npx next build`
        ("Unclosed bracket"), non dai diagnostici CSS dell'IDE (che indicavano una posizione
        fuorviante). **Promemoria**: mai scrivere scorciatoie tipo "h-*/w-*" dentro un commento
        `/* ... */`, va riformulato (es. "h-* e w-*")
      - **Fix definitivo**: prefisso `!` (important-modifier di Tailwind) su ogni classe `h-N`/`w-N`
        applicata a un'icona Font Awesome, in tutti i 18 file del sito pubblico che ne contenevano
        (`h-N` → `!h-N`, incluso il caso con variante breakpoint: `wide:h-N` → `wide:!h-N`, non
        `!wide:h-N` — l'importante va dopo la variante, non prima, altrimenti la classe non è
        valida per Tailwind). `!important` vince sempre su una dichiarazione non-important
        indipendentemente da layer/duplicazioni, quindi robusto per costruzione a differenza di
        `revert-layer`. Applicato con uno script Node temporaneo che modifica solo i token
        `h-N`/`w-N` dentro l'attributo `className` di tag `<FontAwesomeIcon>`/`<HamburgerIcon>`/
        `<CloseIcon>`/`<InstagramIcon>`, lasciando intatte le altre classi (colori, transizioni)
      - Verificato con `npx tsc --noEmit`, `npx eslint`, `npx next build` puliti, poi con Playwright
        contro un dev server riavviato di fresco: icona QR ora 28×28px reali (`h-7`), hamburger
        36×36px (`h-9`), un'icona di controllo altrove (`+`, `h-3`) 12×12px — tutte esattamente
        quanto dichiarato in classe. Controllo visivo con screenshot su home, Botteghe, Bacheca,
        header mobile, pagina token sconto: nessuna regressione, tutte le icone del sito ora
        nitide e correttamente proporzionate invece che schiacciate al default di Font Awesome.
        Dati/file temporanei ripuliti
- [x] **Allineamento verticale icona QR/avatar/hamburger in header corretto (2026-08-27)**: dopo il
      fix delle dimensioni sopra, misurando con Playwright il centro verticale reale di ciascun
      elemento (non solo la dimensione) è emerso che l'icona QR e l'icona hamburger erano ~3px più
      in alto del centro dell'avatar, pur essendo tutti dentro lo stesso contenitore `flex
      items-center`. **Causa**: i due `<button>` che le contengono non erano essi stessi `flex` —
      l'SVG di Font Awesome, come elemento inline, veniva posizionato secondo l'allineamento
      inline/baseline di default del browser (Font Awesome imposta `vertical-align: -0.125em` sulle
      sue icone) invece che centrato nel content-box del bottone. L'avatar, al contrario, era già
      dentro uno `span`/contenitore con `flex items-center justify-center` propri, quindi centrato
      correttamente fin dall'inizio — da qui l'asimmetria. **Fix**: aggiunto `flex items-center
      justify-center` alle classi dei due `<button>` (icona QR e hamburger) in `components/Header.tsx`,
      così l'SVG si centra nel content-box via flexbox invece che per allineamento inline. Non
      toccato il bottone "Chiudi" dentro la modale QR (`<CloseIcon className="!h-5 !w-5" />`,
      riga ~284): è isolato, non affiancato ad altre icone da allineare, fuori dallo scope di questa
      richiesta. Verificato misurando il centro Y di ciascuna icona via Playwright (bounding box
      reali, non solo screenshot): prima 35.03px (icone) vs 37.98px (avatar) — scarto di ~3px; dopo
      tutti e tre esattamente a 38.00px, coincidenti al pixel. Effetto collaterale positivo: le
      aree di tap di QR/hamburger sono ora quadrati puliti (44×44px, 52×52px) invece di rettangoli
      leggermente più alti che larghi (44×49.9px, 52×57.9px) dovuti allo stesso disallineamento.
      Screenshot del logged-in header verificato visivamente. Dati/file temporanei ripuliti
- [x] **Icone header rimpicciolite (2026-08-27)**: su richiesta, ridotte di uno step Tailwind
      mantenendo la gerarchia relativa — QR `h-7`→`h-6` (28→24px), avatar/iniziali `h-8`→`h-7`
      (32→28px), hamburger `h-9`→`h-8` (36→32px). Il centraggio verticale via `flex items-center
      justify-center` sui bottoni (vedi voce precedente) resta valido a qualunque dimensione:
      verificato con Playwright che i tre elementi siano ancora esattamente allineati sullo stesso
      centro Y dopo il ridimensionamento. Screenshot verificato visivamente, dati/file temporanei
      ripuliti
- [x] **Hamburger ulteriormente rimpicciolito, spaziatura header aumentata (2026-08-27)**: icona
      hamburger/chiudi `h-8`→`h-6` (32→24px, ora stessa dimensione dell'icona QR). Spaziatura tra
      gli elementi del blocco destro dell'header (QR, avatar, hamburger) aumentata da `gap-4` a
      `gap-6` (16px→24px). Riverificato con Playwright dopo la modifica: i tre elementi restano
      centrati sullo stesso asse Y (il fix del centraggio via `flex items-center justify-center`
      resta valido a qualunque dimensione/spaziatura) e il click sull'hamburger continua ad aprire
      il menu correttamente. Dati/file temporanei ripuliti
- [x] **Avatar segnaposto (iniziali) in header su sfondo bianco (2026-08-27)**: era `bg-cream`,
      ora `bg-white` — richiesto esplicitamente. Verificato visivamente sia nell'header trasparente
      (hero foto) sia in quello solido, nessuna perdita di leggibilità delle iniziali
- [x] **Scorciatoia a `/scan` in header per chi ha una bottega (2026-08-27)**: icona fotocamera
      (`faCamera`, stessa icona già usata per "Scansiona QR" in `/community/bottega` — coerenza
      visiva, non una scelta nuova) a sinistra dell'icona QR, visibile solo se
      `getShopByAuthorId(session.user.id)` (già esistente in `lib/shops.ts`, nessuna nuova query)
      trova una bottega collegata all'utente loggato. Calcolata in `app/layout.tsx` in parallelo
      alla generazione del QR (`Promise.all`, stesso punto che già faceva una query per pagina) e
      passata come prop `hasShop: boolean` a `Header` — l'query è un lookup su `authorId` (`@unique`
      su `Shop`), costo trascurabile anche ad ogni richiesta
      - **Visibile anche in `/admin`**, a differenza di `InstallAppButton` (nascosto lì): non
        gated da `isAdmin` di proposito, stesso trattamento già riservato a icona QR e avatar
        ("restano utili anche in admin", vedi nota sopra sulla Fase di ottimizzazione mobile) — un
        admin che gestisce anche una propria bottega deve poter raggiungere `/scan` da lì senza
        differenze. **Scoperto durante il test**: la prima versione dello script di verifica
        assumeva (per analogia con `InstallAppButton`) che l'icona dovesse sparire in admin — il
        test falliva, ma era l'assunzione del test ad essere sbagliata, non il codice; corretto il
        test invece del comportamento, dopo aver verificato il precedente reale nel codice
      - Testato con Playwright e due iscritti reali (uno con bottega collegata, uno senza): icona
        assente per chi non ha una bottega, visibile e funzionante (click → naviga a `/scan`) per
        chi ce l'ha, posizionata realmente a sinistra dell'icona QR (bounding box confrontati, non
        solo l'ordine nel markup), visibile anche su `/admin/login`. Dati di test (utenti + bottega)
        ripuliti dal DB di produzione dopo la verifica
- [x] **Login con ritorno alla pagina di partenza (`callbackUrl`, 2026-08-29)**: chi non è loggato
      e arriva su `/eventi/[slug]` finiva su `/community` dopo l'accesso invece di tornare
      all'evento — `signIn()` di Auth.js aveva sempre `redirectTo: "/community"` hardcoded sia per
      Credentials sia per Google, in `app/community/login/actions.ts`
      - `communityLoginAction`/`signInWithGoogleAction` ora accettano un primo argomento
        `callbackUrl: string | undefined` (bind, stesso pattern di `addCommentAction.bind(null,
        slug)` in `CommentForm.tsx`), passato da `app/community/login/page.tsx` via query param
        `?callbackUrl=...` letto con `searchParams` (async, come già in `reset-password/page.tsx`)
      - **`safeCallbackUrl()`**: il valore arriva da un query param, quindi mai fidato as-is —
        deve iniziare per `/` e non per `//` (protocol-relative, sfugge al controllo "inizia con
        /" ma porta comunque fuori dal sito), altrimenti fallback a `/community`. Senza questo
        controllo un link `?callbackUrl=https://sito-malevolo.it` userebbe Auth.js stesso per
        reindirizzare fuori dal sito subito dopo un login riuscito (open redirect) — verificato
        esplicitamente con Playwright passando sia `https://evil.com` sia `//evil.com`: entrambi
        finiscono su `/community`, non sul dominio esterno
      - Solo il link "Accedi" in `/eventi/[slug]` costruisce il `callbackUrl` (verso
        `/eventi/[slug]` stesso) per ora — gli altri ~14 punti del sito che linkano a
        `/community/login` (Header, community, botteghe, ecc.) restano con il comportamento
        precedente (default `/community`), non richiesto estendere a tutti. Il meccanismo è
        comunque generico: `callbackUrl` resta `undefined` se non passato, `GoogleSignInButton`/
        `CommunityLoginForm` restano compatibili con i chiamanti esistenti che non lo passano
        (es. `/community/register`)
      - Testato con Playwright end-to-end: link "Accedi" su un evento reale include il
        `callbackUrl` corretto (URL-encoded) → pagina di login lo preserva nella query string →
        dopo login con credenziali si resta sulla pagina evento, non su `/community` → login
        diretto da `/community/login` senza `callbackUrl` continua a funzionare come prima
        (nessuna regressione). Dati di test ripuliti
