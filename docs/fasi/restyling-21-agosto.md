# Restyling visivo (agosto 2026)

- [x] **Qualità foto hero "Il Borgo"/"Chi siamo" migliorata (2026-08-15)**: `lib/cloudinary-client.ts`
      → `withCloudinaryTransform(url, transformation)`, inserisce una trasformazione in un URL di
      consegna Cloudinary già completo (l'`<img src>` incollato nel contenuto HTML della pagina,
      salvato come `secure_url` intero via `RichTextEditor`, non come `public_id` — a differenza di
      `cloudinaryPreviewUrl()` che parte da un `public_id`), usato per chiedere `f_auto,q_auto:best`
      (formato/qualità migliori per browser) sull'immagine hero in `app/il-borgo/page.tsx` e
      `app/chi-siamo/page.tsx`
      - **Prima diagnosi sbagliata, corretta con le prove dell'inspector di Dario**: il primo
        tentativo (stessa sessione) partiva dall'ipotesi che l'`object-cover` a piena larghezza
        stirasse l'immagine oltre la sua risoluzione nativa (1920×1280, verificato via Cloudinary
        Admin API) sui monitor larghi, e aggiungeva solo `e_sharpen` per compensare — non ha
        risolto nulla. Dario ha poi controllato l'inspector del browser: "rendered size" 640×360
        contro "intrinsic size" 1920×1280 — l'immagine veniva **rimpicciolita** (downscale ~3×),
        non ingrandita: zero perdita di risoluzione, la causa era altrove
      - **Causa reale**: `className="scale-105 object-cover opacity-65 blur-[1px]"` più un
        overlay sfumato — un filtro di sfocatura reale (`blur-[1px]`) sommato a un'opacità ridotta
        (65%) sulla foto stessa, applicato deliberatamente in origine (probabilmente per leggibilità
        del testo sopra) ma percepito giustamente come "foto degradata". L'hero della home
        (`components/home/Hero.tsx`) usa invece il pattern corretto già in uso nel resto del sito:
        nessun blur, nessuna riduzione di opacità sull'immagine, solo un overlay sfumato scuro
        (`bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20`) per il contrasto del testo
      - **Fix**: rimossi `blur-[1px]`, `opacity-65` e `scale-105` (quest'ultimo esisteva solo per
        coprire gli artefatti ai bordi del blur, non più necessario) — resta solo `object-cover`.
        Overlay rinforzato da `from-ink/75 via-ink/30 to-ink/35` a `from-ink/85 via-ink/45 to-ink/40`
        per mantenere la leggibilità del testo (qui centrato verticalmente, non ancorato in basso
        come nella home) senza più il "crutch" della sfocatura/opacità sulla foto. Tolto anche
        `e_sharpen` dalla trasformazione Cloudinary (serviva solo a contrastare il blur CSS, ora
        assente — su una foto già nitida rischiava di risultare artificiale)
      - Verificato visivamente con screenshot locali (1400px, entrambe le pagine): foto nettamente
        più nitide, testo ancora leggibile sopra l'overlay rinforzato. Build/tsc/lint puliti
- [x] **Rimossa sezione "Iniziative" dalla home, sezioni in evidenza edge-to-edge (2026-08-20)**:
      eliminato `components/home/Iniziative.tsx` (non più referenziato altrove) e la sua riga in
      `app/page.tsx`. "Il Borgo utile" (`BachecaHighlight`) e "In evidenza nella community"
      (`CommunityHighlight`) ora condividono lo stesso pattern edge-to-edge: `<section>` a piena
      larghezza con `bg-cream-deep`, contenuto racchiuso in un `<div className="mx-auto max-w-5xl
      ...">` interno — prima `BachecaHighlight` aveva il contenitore `max-w-5xl` direttamente sulla
      `<section>` (niente sfondo a piena larghezza), `CommunityHighlight` era già edge-to-edge ma
      con `bg-cream/30 border-y`. Il placeholder di sfondo della cover in `BachecaHighlight` è stato
      cambiato da `bg-cream-deep` a `bg-cream` per restare visibile sopra il nuovo sfondo di sezione
      identico. Verificato visivamente con screenshot locale a piena pagina (1400px)
- [x] **Bordo `border-ink` scurito nel sito pubblico (2026-08-20)**: `border-ink/10` → `border-ink/20`
      in tutti i componenti/pagine pubblici (card Bacheca/Community/Botteghe, header, sezioni con
      `border-t`/`border-b`, box vari) — non toccato `app/admin/**`, che non usava `border-ink/10`.
      Nei 5 punti dove il bordo base coesisteva con un `hover:border-ink/20` (card `PostCard`,
      `CommunityPostCard`, `ShopCard`, e i blocchi `BachecaHighlight`/`CommunityHighlight` in home)
      l'hover è stato spostato a `border-ink/30`, altrimenti l'hover sarebbe diventato uguale al
      bordo di riposo, perdendo l'effetto. Verificato visivamente con screenshot locale (home,
      1400px) e caricamento di tutte le pagine pubbliche principali senza errori
- [x] **Palette cream più calda, sfondo pagina di default nel sito pubblico (2026-08-21)**:
      `--color-cream` da `#f4f2f2` a `#fff8f4`, `--color-cream-deep` da `#f3efef` a `#f9f2ef` in
      `app/globals.css`. La regola non-layered `body { background: ... }` (quella che vince sempre
      sulle utility Tailwind, vedi nota più sopra sulla cascata CSS) è passata da `#ffffff` fisso a
      `var(--color-cream)`: da qui in poi lo sfondo di default di **tutte** le pagine (body è
      condiviso, non c'è un layout pubblico separato da quello admin) è cream, non più bianco.
      Per lasciare l'area admin bianca/neutra come prima (per scelta deliberata, vedi nota
      "grigio neutro" più sopra su `ShopForm` riusato in admin), aggiunto un wrapper
      `min-h-screen bg-white` nei due punti di ingresso dell'admin che non erano già dentro un
      contenitore con sfondo esplicito: `app/admin/(dashboard)/layout.tsx` (l'unico layout che
      copre già tutte le pagine sotto `/admin` tranne il login) e `app/admin/login/page.tsx`.
      Verificato visivamente con screenshot locali (home, Bacheca, login admin) e leggendo
      `getComputedStyle(document.body).backgroundColor` via Playwright: `rgb(255, 248, 244)` su
      pagine pubbliche, area admin resta visivamente bianca nonostante il body sotto sia cream
- [x] **Sfondo bianco per i moduli di data-entry nel sito pubblico (2026-08-21)**: conseguenza
      diretta del punto sopra — con lo sfondo pagina ora cream, i form isolati (non già dentro una
      card, a differenza di `/contatti` e di `/community/account`) risultavano "nudi" contro il
      body. Aggiunto un wrapper `rounded border border-ink/20 bg-white p-6 shadow-sm md:p-8`
      (stessa classe già usata in `/community/account` e `/contatti`) intorno al form in:
      `/community/new`, `/community/bottega` (entrambi gli stati, bottega esistente/da creare),
      `/community/register`, `/community/login`, `/community/forgot-password`,
      `/community/reset-password` e `/community/verify-email` (in questi ultimi due, in entrambi
      gli stati — link valido/non valido). Non toccati: form inline dentro pagine di contenuto
      (es. il box commenti su `/community/[slug]`) — restano nel loro contesto, non sono "moduli"
      a sé stanti; `/contatti` e `/community/account`, che avevano già una card bianca. Verificato
      visivamente con screenshot locali di tutte le pagine elencate (incluse `/community/new` e
      `/community/bottega` da loggato). **Seguito subito dopo**: i singoli campi (`input`/`select`/
      `textarea`) di tutto il sito pubblico usavano `bg-cream` — quasi invisibile contro le nuove
      card bianche. Cambiata a `bg-white` la classe `inputClass` condivisa (10 file: `AccountForm`,
      `CommentForm`, `CommunityLoginForm`, `CommunityPostForm`, `ContactForm`, `ForgotPasswordForm`,
      `RegisterForm`, `ResendVerificationForm`, `ResetPasswordForm`, `ShopForm`) — non toccati i
      `bg-cream` non pertinenti (label upload immagine stile bottone, pannello menu mobile,
      placeholder cover in `BachecaHighlight`, `UserQrCode`). Ora i campi si distinguono solo per il
      bordo, non per lo sfondo. Verificato visivamente con screenshot locali
- [x] **Stile "elevated card" su tutte le card del sito pubblico (2026-08-21)**: bordo più tenue
      (`border-ink/20` → `border-ink/10`, hover `/30` → `/20` dove presente), radius maggiore
      (`rounded` → `rounded-xl`), ombra a riposo aggiunta (prima c'era solo `hover:shadow-lg`/
      `shadow-sm` su alcune, ora `shadow-md` di base ovunque, `hover:shadow-xl` sulle card
      cliccabili). Applicato a: card cliccabili (`PostCard`, `CommunityPostCard`, `ShopCard`,
      i blocchi `BachecaHighlight`/`CommunityHighlight` in home), `MemberCard` (Iscritti),
      `ContactCard` (riquadri contatto in `/botteghe/[slug]`), e tutte le card bianche dei moduli
      di data-entry aggiunte nella sessione precedente (`/contatti`, `/community/account`,
      `/community/new`, `/community/bottega`, `/community/register`, `/community/login`,
      `/community/forgot-password`, `/community/reset-password`, `/community/verify-email`) —
      stessa stringa di classe duplicata in questi file, aggiornata con replace mirati. Non
      toccati: cornici foto decorative dentro il corpo degli articoli (Il Borgo/Chi siamo/Bacheca),
      la bolla dei singoli commenti su `/community/[slug]` (sfondo `cream-deep`, non `bg-white`,
      trattata come marcatore di contenuto annidato e non come card a sé), `UserQrCode` (usa
      `shadow-inner` deliberatamente per un effetto "incassato", non un'elevazione). Verificato
      visivamente con screenshot locali di home, Bacheca, Iscritti, Botteghe (listino e dettaglio),
      Contatti. **Estesa subito dopo** ai 3 blocchi "Verde popolare" in home
      (`components/home/VerdePopolare.tsx`): prima erano solo una foto incorniciata (`rounded
      border shadow-sm`) con titolo/testo fuori dalla cornice, sotto — non una vera card. Ristrutturato
      in una card unica (immagine edge-to-edge in alto, testo in un `div` con padding sotto, stesso
      pattern di `PostCard`), stessa formula bordo/radius/elevazione delle altre card, mantenuta la
      barra `bg-sage` in fondo alla foto. Verificato visivamente con screenshot locale
- [x] **Bordo `border-ink/20` ammorbidito al 5% nel sito pubblico (2026-08-21)**: gli usi "piatti"
      (non `hover:`) di `border-ink/20` rimasti dopo il giro sulle card — separatori tra header e
      corpo pagina (`border-b`), divisori `border-t`, cornici foto negli articoli, la bolla dei
      commenti su `/community/[slug]`, il pannello menu mobile in `Header.tsx` — passati a
      `border-ink/5`. Sostituzione mirata via sed con placeholder temporaneo per non toccare gli
      `hover:border-ink/20` introdotti nel punto precedente (bordo di hover delle card, resta
      invariato). Non toccato l'admin (non usava `border-ink/20`). Verificato con `grep` che non
      restasse nessun `border-ink/20` piatto e che tutti gli `hover:border-ink/20` fossero intatti,
      più screenshot locali (Bacheca, Contatti)
- [x] **Container `6xl` allargato (2026-08-21)**: aggiunto `--container-6xl: 84rem;` in `@theme
      inline` (`app/globals.css`) — prima non era mai stato sovrascritto, quindi usava il default
      Tailwind (72rem/1152px). Il token alimenta direttamente `max-w-6xl`/`wide:max-w-6xl`, già
      usato come contenitore principale in quasi tutte le pagine pubbliche (Bacheca, Community,
      Botteghe, Soci, Il Borgo, Chi siamo, Contatti, Header, Footer, blocchi home) — un solo punto
      di modifica invece di toccare ogni file. Verificato con
      `getComputedStyle(el).maxWidth` via Playwright (1152px → 1344px) e screenshot locale a
      1920px di viewport (Bacheca)
- [x] **Anteprima link (Open Graph/Twitter Card) per WhatsApp e social (2026-08-21)**: prima non
      c'era nessun `openGraph`/`twitter` in nessuna pagina — i link condivisi mostravano solo il
      favicon (`app/icon.jpg`), mai una foto. `app/layout.tsx` ora imposta `metadataBase` (richiesto
      da Next per risolvere immagini relative) e un `openGraph`/`twitter` di default (foto hero
      statica `/images/home/home-slide-borgo1.jpg`, la stessa della home) — copre tutte le pagine
      senza una propria foto principale (home, listino Bacheca/Community/Botteghe, Contatti, Soci,
      login/registrazione). Le pagine con una vera "foto principale" hanno ora un `generateMetadata`
      dedicato con titolo/descrizione/immagine specifici:
      - `/news/[slug]`: `post.coverImage` (public_id) via `cloudinaryUrl(..., {width:1200,
        height:630, crop:"fill"})`
      - `/community/[slug]` e `/botteghe/[slug]`: `coverImage` è già un secure_url Cloudinary
        completo, ritagliato con `withCloudinaryTransform(url, "w_1200,h_630,c_fill")`
        (`lib/cloudinary-client.ts`, già usata per l'hero di Il Borgo/Chi siamo — nessuna dipendenza
        nuova). **Metadata omessi (fallback al titolo generico) se il post/bottega non è
        `visibility: PUBLIC`**: altrimenti un post `PENDING` o una bottega nascosta dall'admin
        avrebbe esposto titolo/foto/descrizione a chiunque scansioni il link, anche prima
        dell'approvazione o dopo essere stata nascosta — comportamento nuovo, non richiesto
        esplicitamente ma coerente con l'enforcement di visibilità già fatto nel corpo di quelle
        pagine
      - `/il-borgo` e `/chi-siamo`: erano `export const metadata` statico (solo title), convertiti
        in `generateMetadata` per riusare `getPage()`/`parseIntro()` già presenti nel componente e
        prendere la foto hero della pagina (stesso campo Cloudinary mostrato nell'header)
      - Non toccate: pagine senza un concetto di "foto principale" (`/contatti`) — restano sul
        fallback di default
      - Testato con Playwright leggendo i meta tag renderizzati (`og:title`/`og:description`/
        `og:image`/`twitter:image`) su home, listini, un articolo Bacheca reale, un annuncio
        community reale e una bottega reale — URL immagine verificati anche con una richiesta HTTP
        diretta (200 sia sul fallback statico sia su un URL Cloudinary trasformato)
