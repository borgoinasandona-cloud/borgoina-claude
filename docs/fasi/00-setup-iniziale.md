# Setup iniziale del progetto

- [x] Repo inizializzato
- [x] Schema Prisma da PLANNING.md creato (Account/Session/VerificationToken aggiunti per Auth.js),
      **migrato su Neon** (`DATABASE_URL` in `.env`, migrazione `20260716153602_init` applicata).
      Aggiunto anche `Post.featured Boolean @default(false)` (migrazione `20260718104149_add_post_featured`,
      non prevista nel bozza originale di PLANNING.md — vedi sezione "In evidenza" più sotto)
- [x] Setup Cloudinary — credenziali reali in `.env`, upload firmato (`lib/cloudinary.ts`,
      `api/upload/sign`) implementato; usato con successo per caricare le cover dei 16 articoli
      Bacheca importati (via script una tantum, non ancora testato un upload reale dalla UI admin)
- [x] Setup Resend — chiave reale in `.env`. **Dominio `borgoinasandona.it` verificato su Resend
      (SPF/DKIM) il 2026-07-27**: `lib/resend.ts` usa `noreply@borgoinasandona.it` invece del
      sandbox `onboarding@resend.dev`. Verificato inviando una email reale via API (accettata con
      un message id, prova che il dominio è verificato — un dominio non verificato viene rifiutato
      subito da Resend) — testato anche end-to-end nel browser sul form `/contatti` in produzione
      (submit reale → conferma a video, dato di test ripulito da `ContactMessage`)
- [x] **`RESEND_API_KEY` ruotata il 2026-07-29** tramite l'integrazione nativa Vercel↔Resend (nuova
      chiave creata e iniettata automaticamente come env var su Vercel). Verificato che la nuova
      chiave possa ancora inviare da `noreply@borgoinasandona.it` (stesso account/dominio Resend,
      nessuna riconfigurazione necessaria); `.env` locale aggiornato di conseguenza. La vecchia
      chiave risultava ancora attiva al momento del check — se non serve più come backup, va
      revocata a mano dalla dashboard Resend (non automatizzabile da qui)
- [x] Auth admin (Credentials) — verificato end-to-end (login con credenziali corrette → sessione
      valida → accesso a `/admin`; credenziali sbagliate e utenti anonimi vengono respinti)
- [x] Pagine statiche (Il Borgo, Chi Siamo, Contatti) — pubbliche + editor admin. **Il Borgo e Chi
      Siamo hanno contenuto reale pubblicato** (testi/immagini recuperati dal sito attuale e scritti
      su DB). **Contatti resta senza contenuto CMS** (mostra solo l'email statica + form) — nessun
      testo introduttivo fornito finora
- [x] CRUD Bacheca (post + categorie + immagini) — codice completo, **popolata con i 16 articoli
      importati dal listino del sito attuale** (cover, titolo, estratto, categoria — vedi sotto)
- [x] Import contenuti dal sito attuale — completato per Il Borgo, Chi Siamo e i 16 articoli Bacheca
      (cover + titolo + estratto + categoria, dalla pagina `/it/news/` del sito attuale); immagini
      caricate su Cloudinary via script una tantum (poi cancellati, non è rimasta pipeline riusabile).
      `npm run cloudinary:import` resta disponibile per import bulk di cartelle da `materiale/`
- [x] Form contatti → Resend — pagina `/contatti` con form (Server Action), salva anche su
      `ContactMessage` come fallback se l'invio email fallisce; invio email reale non ancora testato
- [x] Redesign front-end pubblico applicando la skill `.claude/skills/frontend-design/` — palette
      brick/terracotta ispirata al logo e all'architettura in mattoni del quartiere, font Big
      Shoulders/Work Sans/IBM Plex Mono, breakpoint custom `wide` a 1570px per monitor grandi,
      sfondo sito bianco con `--color-cream` portato a `#f4f2f2`
- [x] Header pubblico: overlay trasparente con logo bianco sopra le pagine con hero-foto (`/`,
      `/il-borgo`), diventa solido allo scroll (comportamento invariato dallo scaffold iniziale).
      **Struttura del menu ridisegnata il 2026-07-30/31**: la versione originale qui descritta
      (link "Home" rimosso, hamburger solo sotto `md`, "Esci" visibile nel menu) è superata — vedi
      la voce dedicata più sotto ("Header/menù ridisegnati") per lo stato attuale
- [x] Badge "Galleria" sulle card/articoli Bacheca che hanno immagini in galleria o `externalLink`
      (`lib/posts.ts` → `hasGallery()`, `components/GalleryBadge.tsx` — icona Font Awesome
      `faImage` regular dal 2026-07-30, non più l'emoji 🖼️ originale)
- [x] Campo "In evidenza" su `Post` (admin: checkbox in `PostForm.tsx`) — se true, l'articolo appare
      nella sezione "Il Borgo utile" della home al posto del più recente (`getFeaturedPost()` in
      `lib/posts.ts`, con fallback al post più recente se nessuno è marcato)
- [x] Admin: nav raggruppata in "Pagine" (Il Borgo/Chi siamo/Contatti) e "Articoli" (Bacheca/Categorie);
      lista Bacheca ordinata per data di pubblicazione decrescente
- [x] **Blocco "Il Borgo utile" (articolo in evidenza) ridisegnato per le foto verticali
      (2026-11-06)**: `components/home/BachecaHighlight.tsx`. La box immagine aveva `aspect-video`
      fisso (16:9) anche da `sm` in su (layout a riga, immagine a sinistra): con una cover verticale
      (es. locandina di un evento) `object-cover` tagliava via gran parte della foto per forzarla in
      un riquadro larghissimo e basso. **Causa radice verificata**: `cloudinaryUrl()` qui passa solo
      `width` a Cloudinary (mai `height`), quindi `crop: "fill"` non ritaglia nulla lato Cloudinary —
      tutto il taglio avveniva via CSS (`aspect-video` + `object-cover`), quindi la leva giusta era
      lì, non lato immagine. **Fix**: da `sm` in su `aspect-video` diventa `sm:aspect-auto` — la box
      si stira all'altezza della colonna di testo accanto (flex row, stretch di default) invece di
      un rapporto fisso, quindi una foto verticale viene tagliata molto meno (l'altezza disponibile
      è quella reale del contenuto, non più schiacciata a 16:9). Sotto `sm` (stack verticale) resta
      `aspect-video` invariato — il problema segnalato era specifico del desktop, non richiesto
      toccare mobile. **Colonna di testo ristrutturata** su richiesta esplicita: da un singolo blocco
      centrato verticalmente a tre fasce (`flex flex-col` su tutta l'altezza) — categoria in alto
      (invariata), titolo+estratto in un div `flex-1 flex flex-col justify-center` in mezzo (quindi
      centrati nello spazio restante, non dell'intera colonna), e una riga finale con data a sinistra
      (stesso formato `Intl.DateTimeFormat("it-IT", { dateStyle: "long" })` già usato in
      `PostCard.tsx`) e un nuovo CTA "Leggi di più" con icona `faThumbtack` (pin, mai usata altrove
      nel progetto — scelta deliberatamente diversa dalla freccia `faArrowRight` usata per le CTA di
      navigazione altrove, per richiamare "in evidenza/fissato" invece che "vai a") a destra.
      Verificato con Playwright su un post reale di produzione con cover verticale ("Andrea
      Pennacchi ospite del borgoINA", locandina ritratto): molta meno porzione di foto tagliata
      rispetto a prima, le tre fasce (categoria/titolo+estratto/data+CTA) renderizzate nell'ordine e
      posizione attesi. Controllato anche il mobile (sotto `sm`): layout impilato invariato nella
      sostanza, nessuna rottura dalle nuove classi flex condivise tra i breakpoint. `tsc`/`eslint`
      puliti, file temporanei ripuliti
- [x] **Blocco "Il Borgo utile": rifinitura data/CTA/pin e padding, corretta dopo un primo giro
      (2026-11-06)**: stessa giornata della voce precedente, richiesta di rifinitura della stessa
      colonna di testo. **Primo tentativo**: riga categoria+data con `justify-between` (data spinta
      tutta a destra), CTA "Leggi di più" con icona `faThumbtack`, badge pin tondo sovrapposto
      all'angolo in alto a destra **dell'immagine**. **Corretto subito dopo su richiesta esplicita**:
      la data va "appena a destra delle categorie" (riga `items-center gap-3` senza `justify-between`,
      niente più spinta a fine riga), la CTA torna all'icona `faArrowRight` (coerente con le altre CTA
      del sito, l'icona pin restava solo per il badge), e il badge pin tondo si sposta dall'immagine
      all'angolo in alto a destra **della colonna di testo** (non più sopra la foto) — la colonna di
      testo diventa `relative` e il badge è `absolute top-4 right-4` al suo interno, con un
      `pr-12` sulla riga categoria+data per non finire sotto al badge. Aggiunto anche più padding
      interno alla colonna di testo sui viewport larghi (`p-6 sm:p-8 md:p-10 wide:p-12`).
      **Bug scoperto mentre si verificava il padding a `wide:`, corretto alla radice**: `wide:p-12`
      non si applicava mai a 1700px di viewport (restava il valore di `md:`, 40px invece di 48px) —
      e lo stesso valeva per `wide:text-8xl` sull'H1 della home (restava `lg:text-7xl`, 72px invece
      di 96px) e **presumibilmente ogni altro `wide:` del sito che competeva con `md:`/`lg:`/`xl:`
      sulla stessa proprietà**, da quando il breakpoint `wide` è stato introdotto. Confermato non
      essere cache del dev server (riprodotto identico con `.next` cancellato e processo riavviato
      da zero) né una variante arbitraria rotta (anche `min-[1570px]:p-12` falliva allo stesso modo),
      ma un breakpoint di Tailwind di default (`xl:p-12`, 1280px) applicato sulla stessa proprietà
      **funzionava correttamente** — isolando il problema al breakpoint custom `wide` stesso, non al
      meccanismo di cascata in generale. **Causa radice**, trovata nella documentazione ufficiale
      Tailwind invece di continuare a tentare correzioni a caso: tutti i breakpoint vanno dichiarati
      nella stessa unità di misura di quelli di default (`rem`), altrimenti l'ordinamento interno
      delle varianti responsive si rompe in modo silenzioso — `--breakpoint-wide` in `app/globals.css`
      era dichiarato in **px** (`1570px`) invece che in **rem**, mescolato con gli `sm/md/lg/xl/2xl`
      di default (tutti in rem). Corretto in `98.125rem` (= 1570px esatti, nessun arrotondamento).
      **Effetto**: fix non isolato al solo padding appena aggiunto, ma retroattivo su ogni `wide:`
      già presente nel sito (verificato: l'H1 della home torna a 96px come da codice originale,
      il contenitore `wide:max-w-6xl` resta 1344px come prima — nessuna regressione, solo i casi
      prima silenziosamente rotti ora funzionano). Confine del breakpoint verificato esatto a pixel
      (1569px → ancora `md`/`lg`, 1570px → `wide` applicato). Rimesso `wide:p-12` nel componente
      (il valore temporaneo `xl:p-12` usato per isolare il bug è stato tolto). Verificato con
      Playwright su dati reali: data accanto alle categorie, pin tondo in alto a destra della
      colonna di testo (non più sull'immagine), CTA con freccia, padding 48px a ≥1570px — sia
      desktop sia mobile. `tsc`/`eslint` puliti, file temporanei ripuliti
- [x] **Sottotitolo facoltativo per gli articoli Bacheca (2026-11-06)**: nuovo campo `Post.subtitle`
      (`String?`, migration `add_post_subtitle`). Distinto apposta da `excerpt`, che già esisteva:
      `excerpt` è il riassunto breve usato nelle card/anteprime (`PostCard.tsx`,
      `BachecaHighlight.tsx`) e come meta-description; `subtitle` è mostrato **solo** sotto l'H1
      nella pagina del singolo articolo (`app/news/[slug]/page.tsx`, stile italiano `text-ink-soft
      italic`, stesso trattamento già usato per `Shop.slogan` sotto il nome bottega) — non tocca le
      anteprime/listini di proposito, nessuna richiesta in merito. Form admin (`PostForm.tsx`):
      input di testo singolo (non textarea, è un sottotitolo breve) tra Titolo/Slug ed Estratto,
      etichettato "(facoltativo)". `postSchema` in `lib/validations.ts` e `parsePostFormData` in
      `app/admin/(dashboard)/posts/actions.ts` aggiornati — il resto dell'action non ha richiesto
      modifiche, usa già uno spread generico (`...data`) verso `prisma.post.create/update`.
      Verificato con Playwright creando un vero articolo via `/admin/posts/new` (titolo, slug,
      sottotitolo, contenuto via toggle "Visualizza codice sorgente" dell'editor invece di
      simulare la digitazione nell'editor visuale Tiptap, più affidabile per un test automatico),
      confermato il sottotitolo visibile nella pagina pubblica nella posizione/stile attesi,
      articolo di test eliminato subito dopo dal DB di produzione. `tsc`/`eslint` puliti, file
      temporanei ripuliti
      - **Sottotitolo esteso anche al blocco "In evidenza" in home (2026-11-06, richiesta subito
        successiva)**: `components/home/BachecaHighlight.tsx`, tra `<h3>` ed estratto, stesso
        stile (`text-ink-soft italic`) della pagina articolo. Nessuna modifica allo schema/azioni
        (già pronti dalla voce precedente), né a `getFeaturedPost()` in `lib/posts.ts` (nessun
        `select` esplicito, i campi scalari passano già tutti). Verificato prima creando un
        articolo di test con `featured: true`, poi scoperto che non serviva: `getFeaturedPost()`
        ordina per `publishedAt desc` e, a parità di data con un articolo reale già featured, **non
        garantisce quale vince** (nessun tie-break esplicito su `id`/`createdAt`) — nel caso reale
        ha vinto l'articolo esistente, non quello di test appena creato. Verificato quindi
        direttamente sul sito con un sottotitolo reale già presente su un articolo in evidenza
        reale ("Andrea Pennacchi ospite del borgoINA" → "14 Novembre al Grop", aggiunto da Dario
        nel frattempo usando il form appena costruito): compare correttamente in home nella
        posizione attesa. Articolo di test comunque ripulito dal DB di produzione. `tsc`/`eslint`
        puliti, file temporanei ripuliti
      - **Blocco titolo/sottotitolo/estratto con larghezza massima e centrato (2026-11-06)**:
        stesso componente, il `div` che racchiude `<h3>`+sottotitolo+estratto guadagna
        `max-w-[600px] mx-auto` (richiesto letteralmente come `max-width: 600px; margin: 0 auto`).
        Essendo figlio di un contenitore `flex flex-col` (stretch di default sull'asse
        orizzontale), gli margini automatici assorbono lo spazio in eccesso quando lo spazio
        disponibile supera 600px, centrando il blocco; sotto i 600px disponibili (es. a `md`, con
        meno padding) il blocco riempie semplicemente tutto lo spazio come prima, senza alcuna
        differenza visibile. La riga categoria+data sopra e il CTA "Leggi di più" sotto restano
        larghi quanto tutta la colonna, non rientrano nel vincolo — solo testo+sottotitolo+estratto
        si restringono e centrano. Verificato misurando la larghezza reale del blocco via
        Playwright: 510px (= spazio disponibile) a 1400px di viewport (sotto i 600px disponibili,
        nessun effetto), esattamente 600px e centrato a 1700px di viewport (sopra, il vincolo
        scatta). Screenshot per la resa visiva a entrambe le larghezze. `tsc`/`eslint` puliti, file
        temporanei ripuliti
