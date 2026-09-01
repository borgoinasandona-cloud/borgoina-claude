# Installazione come app (PWA leggera)

- [x] **Installazione come app da home screen (PWA "leggera", 2026-08-27)**: bottone per salvare
      il sito sulla schermata Home del telefono con aspetto da app — nessun service worker,
      nessuna cache offline, solo manifest + icone + il bottone stesso: non richiesto e fuori
      scope, avrebbe introdotto complessità (gestione cache/aggiornamenti) senza che sia mai stato
      chiesto
      - `app/manifest.ts` (convenzione file di Next.js, genera da solo `/manifest.webmanifest` e
        il `<link rel="manifest">`, nessun collegamento manuale — stesso meccanismo già in uso per
        `app/icon.jpg`): nome/nome corto, `display: "standalone"`, `theme_color` #b54a2a (brick),
        `background_color` #fff8f4 (cream, stessi colori del brand)
      - Icone rigenerate da `public/logo/borgo-icona.jpg` (400×400, l'unica sorgente quadrata
        disponibile) a 192×192 e 512×512 via `sharp` (già presente come dipendenza transitiva di
        Next.js, nessun pacchetto nuovo) — **dimensioni reali, non semplicemente ridichiarate**:
        Chrome verifica che esistano davvero un'icona ≥192px e una ≥512px prima di considerare il
        sito installabile, altrimenti l'evento `beforeinstallprompt` (da cui dipende il bottone su
        Android/Chrome) non scatta mai. `app/apple-icon.png` (convenzione Next.js per
        `<link rel="apple-touch-icon">`) riusa la 512px
      - `appleWebApp` in `app/layout.tsx` (`capable`, `statusBarStyle`, `title`) + nuovo export
        `viewport` con `themeColor`: iOS non legge affatto il manifest per questi aspetti (a
        differenza di Chrome/Android), servono i meta tag dedicati perché l'app aperta da home
        screen non mostri la barra indirizzi di Safari
      - `components/InstallAppButton.tsx`: **due percorsi completamente diversi**, perché Safari/
        iOS non ha alcuna API programmatica per attivare "Aggiungi a Home" (scelta deliberata di
        Apple) — su Chrome/Edge/Android intercetta `beforeinstallprompt` e chiama `.prompt()` sul
        click; su iOS mostra una modale con le istruzioni manuali (Condividi → Aggiungi alla
        schermata Home), l'unica cosa possibile. Il bottone si nasconde da solo se: l'app è già
        installata (rilevato via `matchMedia("(display-mode: standalone)")`, con listener `change`
        per aggiornarsi dopo un'installazione mentre la pagina resta aperta — niente ricarica
        necessaria), oppure su desktop/browser che non supportano nessuno dei due percorsi (niente
        prompt nativo e non iOS)
      - **`isIOS`/`isStandalone` letti con `useSyncExternalStore`, non `useState`+`useEffect`**:
        stesso pattern già in uso in `components/Header.tsx` per "mounted" — leggere
        `window`/`navigator` dentro un `useEffect` e poi chiamare `setState` sincronamente nel
        corpo dell'effetto è segnalato dalla regola eslint `react-hooks/set-state-in-effect` del
        progetto (stessa famiglia di regole di "purity" già incontrata per `Date.now()`)
      - **Bug reale trovato e corretto durante la verifica**: nel testo della modale iOS, uno
        spazio letterale dopo `</strong>` all'inizio di una nuova riga JSX veniva ancora una volta
        eliminato dal compilatore SWC ("Condividi(l'icona" invece di "Condividi (l'icona") — stesso
        identico bug già documentato per `/come-funzionano-gli-sconti`. Corretto con `{" "}`
        esplicito, verificato leggendo `innerText` del testo effettivamente renderizzato (non solo
        lo screenshot) prima e dopo il fix
      - Testato con Playwright (Chromium headless + emulazione iPhone 13 + `matchMedia` sovrascritta
        per simulare la modalità standalone, dato che l'emulazione dispositivo di Playwright non
        copre `display-mode`): bottone assente su desktop senza `beforeinstallprompt`, visibile e
        funzionante su iOS (click → modale con istruzioni corrette), assente se già "installata"
        (standalone simulato). Build reale (`next build`) verifica che `/manifest.webmanifest` e
        `/apple-icon.png` vengano effettivamente generati. **Non verificabile da qui**: il vero
        comportamento del prompt nativo Android/Chrome (richiede un Chrome reale che valuti
        l'installabilità, non riproducibile in Playwright headless) — da provare a mano su un
        device reale dopo il deploy
      - **Spostato dall'header al fondo del menu mobile (2026-08-27), su richiesta esplicita**:
        tolta l'icona sola (download) dall'header pubblico; il bottone (ora con icona + testo
        "Installa l'app") vive in fondo al pannello del menu hamburger, come terzo elemento
        `col-span-2` sotto le due colonne Pagine/Partecipa, visibile solo sotto il breakpoint `sm`
        (`sm:hidden` — su schermi più larghi installare il sito come app ha meno senso). Refactor
        di `components/InstallAppButton.tsx`: la classe del contenitore (bordo/margine/
        `sm:hidden`) è passata come prop `wrapperClassName` e applicata a un `<div>` che avvolge
        l'intero componente (bottone + eventuale modale iOS), non più solo al `<button>` — così
        quando il componente ritorna `null` (non installabile/già installata) sparisce anche il
        wrapper, invece di lasciare un divisore "orfano" (bordo/margine visibile senza il bottone
        dentro) nel menu. Verificato con Playwright: icona sparita dall'header, bottone presente e
        cliccabile in fondo al menu su viewport stretto (iPhone 13, 390px), stesso user agent iOS
        ma viewport ≥640px → bottone nascosto (`sm:hidden` rispettato), nessun bottone/divisore
        residuo su desktop non installabile (nessun wrapper orfano)
      - **Colore cambiato da `bg-brick` a `bg-ink` (2026-08-27)**: nella prima versione il bottone
        condivideva il colore brick con la pillola "Botteghe" proprio sopra di lui nello stesso
        menu — confusione esplicitamente segnalata. Le tre tinte accento (`sage`/`brick`/`sky`)
        sono già tutte assegnate a Mercatino/Botteghe/Iscritti in `navLinkAccentClasses`
        (`lib/site-config.ts`), quindi niente nuova tinta brand: usato `ink` (già la base di
        testo/bordi in tutto il sito), che legge come azione di sistema/utility piuttosto che
        come destinazione di navigazione — coerente con la sua natura diversa dalle tre pillole
        colorate sopra
      - **Bug reale segnalato da Dario e corretto (2026-08-28)**: le istruzioni della modale
        dicevano sempre "nella barra di Safari", ma la rilevazione controllava solo se il
        dispositivo fosse iOS, non quale browser — su Chrome per iPhone (provato da Dario dal
        vivo) il testo era quindi sbagliato: il pulsante Condividi di Chrome iOS sta in alto a
        destra nella barra degli indirizzi, non in basso come su Safari, e va anche scorso verso
        il basso per trovare "Aggiungi alla schermata Home" nel menu che si apre. Verificato il
        comportamento reale di Chrome iOS via ricerca (browserstack.com/guide/add-chrome-to-home-screen)
        prima di scrivere il testo, invece di assumere fosse identico a Safari. Aggiunta
        `getChromeIOSSnapshot()` (rileva il token `CriOS` nello user agent — presente solo in
        Chrome su iOS, mai in Safari puro, dato che tutti i browser iOS sono obbligati da Apple a
        usare il motore WebKit di Safari ma non necessariamente la sua UI) e due testi distinti
        nella modale. Verificato con Playwright (user agent iPhone reale vs user agent Chrome iOS
        con token `CriOS` spoofato) leggendo l'`innerText` effettivamente renderizzato per
        entrambi i casi, non solo uno screenshot — nessuna regressione sul bug dello spazio
        mancante già corretto in precedenza (verificato che `{" "}` resti presente in entrambi i
        rami di testo)
      - **Bordo bianco intorno all'icona su Android, segnalato da Dario dopo l'installazione reale
        (2026-08-28)**: causa nota — senza un'icona dichiarata `purpose: "maskable"` nel manifest,
        Android non sa che l'artwork (mattoni bordo a bordo) riempie già tutto il riquadro, quindi
        per sicurezza rimpicciolisce l'icona dentro una "safe zone" più piccola e riempie il resto
        con uno sfondo bianco. Corretto in `app/manifest.ts` aggiungendo una seconda entry per
        ciascuna icona (192/512) con `purpose: "maskable"` accanto a quella `"any"` già presente —
        stesso file immagine, due dichiarazioni. **Non la forma combinata `"any maskable"`**
        (spaziata, valida per lo standard Web App Manifest): il tipo `MetadataRoute.Manifest` di
        Next.js accetta un solo valore letterale per `purpose`, non una stringa con più valori
        separati da spazio — due entry separate con lo stesso `src` sono l'equivalente supportato
        dal tipo. Verificato che `/manifest.webmanifest` esponga davvero le 4 entry (2 dimensioni ×
        2 purpose) e build reale pulita. **Non verificabile da qui**: il risultato visivo va
        confermato disinstallando e reinstallando l'app su un device Android reale (comportamento
        del launcher di sistema, non riproducibile in ambiente headless)
      - **Sorgente icona sostituita con `public/logo/icon-app.jpg` (2026-08-28)**: Dario ha fornito
        un'immagine dedicata per l'icona app (750×750, sfondo arancione pieno bordo a bordo con
        colomba + "SAN DONÀ", soggetto centrato con margine dai bordi — pensata apposta per il
        ritaglio "maskable", non un riuso del logo generico). `public/logo/borgo-icona.jpg`
        (400×400, usata invece per la favicon via `app/icon.jpg`, invariata) resta la sorgente
        solo per quello. 192/512 e `app/apple-icon.png` rigenerati da zero con `sharp` dalla nuova
        immagine
