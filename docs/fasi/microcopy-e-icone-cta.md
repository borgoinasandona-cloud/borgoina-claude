# Microcopy e icone CTA

- [x] **Frecce delle CTA sostituite con l'icona FontAwesome `faArrowRight` (2026-08-26)**: prima
      erano il carattere unicode "→" incorporato nel testo del link — sostituito ovunque un link/
      bottone sia una call to action con freccia, in 8 punti: `components/home/VerdePopolare.tsx`
      (card token), `components/home/BachecaPreview.tsx` ("Vedi tutte"), `components/MemberCard.tsx`
      ("Vedi la sua bottega"), `app/botteghe/page.tsx` ("La mia bottega"),
      `app/botteghe/[slug]/page.tsx` ("Apri il profilo" Instagram), `app/community/page.tsx`
      ("Il mio account"), `app/community/bottega/page.tsx` ("Vedi la pagina pubblica"),
      `app/community/account/page.tsx` (i due bottoni "Crea un annuncio"/"Gestisci la tua bottega").
      Ogni link diventato `inline-flex items-center gap-1` (o `gap-1.5` dov'era già così) con
      `<FontAwesomeIcon icon={faArrowRight} />` come figlio separato, non più testo con `→` in coda.
      **Non toccati deliberatamente** i due usi di "→" che non sono CTA ma indicano un percorso di
      navigazione dentro una frase (`Il mio account → Tessera digitale`, in
      `app/come-funzionano-gli-sconti/page.tsx` e nel riquadro sconti di `/botteghe/[slug]`) — l'icona
      lì stonerebbe (richiesta iniziale specifica su "arrow-right", i "←" dei link "Torna a…" sono
      stati convertiti subito dopo — vedi voce successiva). Verificato con `tsc`/`eslint` puliti,
      smoke test di tutte le pagine coinvolte (200, nessun errore JS) e screenshot su home
      (Bacheca/Verde popolare) e una card socio con bottega collegata
- [x] **Frecce "Torna a…" sostituite con `faArrowLeft` (2026-08-26)**: stesso trattamento delle CTA
      in avanti, applicato ai 3 back-link del sito pubblico (`app/botteghe/[slug]/page.tsx`,
      `app/community/[slug]/page.tsx`, `app/news/[slug]/page.tsx`). **Non toccati i 3 back-link
      analoghi nell'admin** (`/admin/botteghe/[id]/tokens`, `/edit`, `/new`): l'admin non ha mai
      importato FontAwesome, resta deliberatamente "grigio neutro" e distinto dal sito brandizzato
      (vedi note precedenti su `ShopForm` in admin) — introdurre icone lì sarebbe fuori dal pattern
      esistente e non richiesto. Verificato con `tsc`/`eslint` puliti e screenshot sui back-link di
      Bacheca e Botteghe
- [x] **"+" sostituito con `faPlus` nei bottoni CTA del sito pubblico (2026-08-26)**: i due bottoni
      brick pieni "+ Crea la tua pagina" (`app/botteghe/page.tsx`) e "+ Nuovo annuncio"
      (`app/community/page.tsx`) ora usano `<FontAwesomeIcon icon={faPlus} />` al posto del
      carattere `+` letterale. **Non toccati** "+ Nuova bottega" in
      `app/admin/(dashboard)/botteghe/page.tsx` e "+ Nuovo token" in `components/TokenForm.tsx`,
      stesso motivo dei back-link sopra: sono pulsanti dell'area admin, mai stata toccata dal
      lavoro sulle icone FontAwesome fatto in questa sessione
- [x] **Card "Ultime dalla Bacheca" orizzontali solo in mobile (2026-08-30)**: dentro ogni singola
      card della sezione home (immagine sopra, testo sotto a tutti i breakpoint) diventa, solo
      sotto `sm`, immagine a sinistra (colonna quadrata stretta, `w-28`) e contenuto a destra —
      niente cambi alla griglia esterna (resta 1 colonna sotto `sm`, 2 da `sm`, 4 da `lg`, come
      prima di questa sessione: un primo tentativo di passare la griglia stessa a 2 colonne in
      mobile è stato provato e poi scartato da Dario a favore di questo layout per-card)
      - `components/PostCard.tsx` (condiviso anche con `/news`, che deve restare invariata) prende
        un nuovo prop opzionale `mobileHorizontal` (default `false`): quando `true`, il `<Link>`
        esterno passa da `block` a `flex flex-row sm:block`, l'immagine da `aspect-video w-full` a
        `aspect-square w-28 shrink-0` sotto `sm` (tornando `aspect-video w-full` da `sm` in poi), e
        il contenuto guadagna `min-w-0` (necessario perché `line-clamp` funzioni dentro un figlio
        flex, che altrimenti non si restringe sotto la larghezza del contenuto). Solo
        `components/home/BachecaPreview.tsx` passa `mobileHorizontal`; `app/news/page.tsx`
        continua a chiamare `<PostCard post={post} />` senza il prop, comportamento identico a
        prima
      - Verificato con Playwright/screenshot su tre punti: home mobile (390px, layout orizzontale
        confermato), `/news` mobile (390px, stack verticale invariato — nessuna regressione sulla
        pagina condivisa), home desktop (1400px, griglia a 4 colonne con card verticali invariata)
      - **Categorie e data sulla stessa riga, data in cifre (2026-08-30)**: sempre per risparmiare
        spazio nella colonna stretta, solo quando `mobileHorizontal` — categorie a sinistra, data
        a destra in formato `dd/mm/aa` (`Intl.DateTimeFormat("it-IT", { day: "2-digit", month:
        "2-digit", year: "2-digit" })`, non più `dateStyle: "long"`) invece che su una riga
        separata sotto il titolo. Il paragrafo data in formato lungo esistente resta invariato
        (e continua a comparire) quando `mobileHorizontal` è `false`, cioè su `/news` e nella
        stessa home da `sm` in su. Verificato con Playwright cercando il pattern `dd/mm/aa` nel
        testo della home mobile (trovato) e che `/news` mobile mostri ancora il mese per esteso
        ("agosto", invariato)
