# Fase 4 — Botteghe

- [x] **Botteghe (2026-07-31)**: pagina di presentazione della propria attività per gli iscritti —
      vedi PLANNING.md "Fase 4" per la descrizione funzionale. Note implementative:
      - Modelli `Shop`/`ShopImage` + enum `ShopCategory` in `prisma/schema.prisma` (migration
        `20260731090741_add_shop`), riusa l'enum `Visibility` esistente — nessun problema di
        "nuovo valore enum usato subito" incontrato con `CommentVisibility` in Fase 3, perché qui
        non si aggiunge un valore nuovo, solo nuove tabelle che referenziano l'enum già presente
      - `authorId String @unique` su `Shop` applica "una bottega per utente" a livello DB, non solo
        in app
      - `lib/shops.ts` e `app/community/bottega/actions.ts` rispecchiano quasi 1:1 `lib/community.ts`
        e le action di `CommunityPost` (stesso `requireUser()`/`requireAdmin()`). La galleria
        immagini (`ShopImage`) segue invece il pattern di `PostImage`/
        `app/admin/(dashboard)/posts/actions.ts`: stato locale `images` nel form, hidden input
        `imagesJson`, sostituzione con transazione `deleteMany` + `create` lato server
      - **Niente moderazione preventiva (cambiato il 2026-07-31)**: la prima versione nasceva
        `visibility: PENDING` con approvazione admin, come `CommunityPost` — tolta su richiesta
        esplicita. `Shop.visibility` ora ha `@default(PUBLIC)` (migration
        `20260731095028_shop_public_by_default`, nessuna riga reale da migrare: la feature era
        appena stata rilasciata, zero bottege create da utenti veri). Il campo `visibility` resta
        nel modello e nell'enum condiviso `Visibility` solo per dare all'admin un modo non
        distruttivo di nascondere contenuti inappropriati a posteriori (`/admin/botteghe` →
        pulsanti "Nascondi"/"Pubblica", azioni `hideShopAction`/`publishShopAction` in
        `app/admin/(dashboard)/botteghe/actions.ts`, rinominate da `rejectShopAction`/
        `approveShopAction`) — `PENDING` non viene più impostato da nessun percorso applicativo
      - Modificare una bottega già pubblica non la nasconde né la tocca in alcun modo lato
        visibilità (nessuna moderazione da re-innescare, a differenza di quanto valutato per
        `CommunityPost`)
      - Autore **in evidenza** sulla pagina pubblica: blocco "Gestita da" con avatar
        (`User.image`, la stessa foto profilo di Fase 2) o iniziali come fallback, subito sotto il
        titolo in `app/botteghe/[slug]/page.tsx` — riflette la logica esplicita del prodotto: chi
        si iscrive alla community può avere anche una pagina della propria attività, e la pagina
        deve restare visibilmente legata a quella persona
      - Categoria (`ShopCategory`: `CRAFTS`/`SHOP`/`FOOD`/`SERVICES`/`OTHER`) è un enum fisso come
        `CommunityPostType`, non un modello `Category` gestibile da admin come per `Post` — scelta
        per coerenza con l'unico altro precedente di categorizzazione "generata dagli iscritti"
      - "Botteghe" inizialmente lasciata come link semplice nel menù; spostata su richiesta
        nella colonna "Partecipa" come terza pillola colorata accanto a Bacheca/Community
        (`navLinkAccentClasses` esteso con un terzo accent `"brick"`, `bg-brick text-white
        hover:bg-brick-dark` — stesso `brick` del bottone Accedi ma `text-white` invece di
        `text-cream` per restare leggermente distinta, non c'è una quarta tinta libera in
        palette)
      - Testato end-to-end con Playwright (due giri, prima e dopo la rimozione della moderazione):
        creazione → subito `PUBLIC` e visibile su `/botteghe` senza alcun intervento admin →
        blocco "Gestita da" presente con nome/iniziali corretti → filtro categoria funziona →
        dettaglio pubblico mostra contatti/indirizzo/galleria → admin nasconde (404 pubblico
        immediato) e ripubblica da `/admin/botteghe` → modifica dell'autore non cambia la
        visibilità → eliminazione. Dati di test ripuliti dal DB di produzione dopo la verifica
      - **Campi "Chi siamo"/"Contatti" + CTA (2026-07-31)**: aggiunti a `Shop` `slogan`,
        `history` ("da quanti anni esiste/storia"), `whyChooseUs` ("perché sceglierci"),
        `instagram` (canale della bottega, distinto da `siteConfig.instagramUrl` del comitato) e
        `hours` (orari, testo libero multi-riga) — migration
        `20260731102931_shop_about_and_contact_fields`. `ShopForm.tsx` riorganizzato in due sezioni
        con divisore (`SectionHeading`, stile eyebrow): "Chi siamo" (slogan, descrizione, storia,
        perché sceglierci) subito dopo il campo categoria, poi "Contatti" (indirizzo, telefono/
        WhatsApp, email, sito, Instagram, orari)
      - Pagina pubblica: slogan come tagline corsiva sotto il titolo; card del listino
        (`ShopCard.tsx`) mostra lo slogan al posto dell'estratto della descrizione quando presente
        (è letteralmente il suo scopo — una frase corta ad effetto per il listino); storia e
        "perché sceglierci" come blocchi separati sotto la descrizione; sezione "Contatti" con
        icone (indirizzo, orari, email, sito, Instagram)
      - **Pulsanti CTA automatici**: "Scrivimi su WhatsApp" (verde brand WhatsApp `#25D366`,
        icona `faWhatsapp` da `free-brands-svg-icons` — il logo non esiste in regular/solid) e
        "Chiama ora" (outline, `tel:`), mostrati solo se `phone` è valorizzato. Il numero italiano
        inserito dall'iscritto (es. "340 1234567", senza prefisso) va convertito in formato
        internazionale per il link `wa.me`: `lib/phone.ts` → `toWhatsAppNumber()` normalizza
        aggiungendo `39` se il numero non ha già un prefisso paese — approssimazione dichiarata,
        pensata per numeri italiani (il sito è per un comitato di quartiere locale, non per un
        pubblico internazionale)
      - Testato end-to-end con Playwright: tutti i nuovi campi salvati e mostrati nell'ordine
        corretto nel form, pagina pubblica mostra slogan/storia/perché-sceglierci/contatti/orari,
        link WhatsApp verificato byte-per-byte (`340 1234567` → `https://wa.me/393401234567`),
        link "Chiama ora" (`tel:340 1234567`) e Instagram della bottega corretti, card del listino
        mostra lo slogan. Dati di test ripuliti dopo la verifica
      - **Sezione Contatti in card (2026-07-31)**: da lista verticale con icona a griglia di
        card (`grid sm:grid-cols-2`, componente locale `ContactCard` in
        `app/botteghe/[slug]/page.tsx`) — stesso stile `rounded border border-ink/10 bg-white
        shadow-sm` già usato per il box del modulo di contatto in `/contatti`, icona in un
        cerchietto `bg-brick/10 text-brick`. Verificato visivamente desktop e mobile
      - **Admin può modificare i contenuti di una bottega altrui (2026-07-31)**: nuova pagina
        `/admin/botteghe/[id]/edit` (link "Modifica" in `/admin/botteghe`), riusa `ShopForm.tsx`
        — reso generico con una prop `action` opzionale (default `saveShopAction` per l'iscritto),
        l'admin passa `adminUpdateShopAction.bind(null, shop.id)` che opera sull'`id` invece che su
        `authorId === utente loggato`. Il parsing del form (`parseShopFormData`) è stato spostato
        da `app/community/bottega/actions.ts` a `lib/shops.ts` per essere condiviso dalle due
        action: un file con `"use server"` in cima richiede che **ogni** export sia una funzione
        async (build error altrimenti — `parseShopFormData` è sync), quindi non poteva restare in
        un file azioni. `ShopFormState` ora ha anche `"success"` (prima solo `idle`/`error`, perché
        il salvataggio dell'iscritto fa sempre redirect e non tornava mai "success"; il salvataggio
        admin invece resta sulla pagina e mostra conferma inline, come `updatePostAction`).
        Modificare non tocca `visibility` né lo `slug`. `ShopForm` riusato così com'è (stile
        brand pubblico, cream/brick) dentro il layout admin (grigio neutro) — visivamente un po'
        diverso dal resto di `/admin` ma nessuna duplicazione del form; accettabile, non
        richiesto altrimenti. Testato end-to-end: un iscritto non-admin non può aprire la pagina
        (redirect a `/admin/login`), l'admin apre da `/admin/botteghe`, modifica nome e
        descrizione di una bottega altrui, la modifica si riflette subito sulla pagina pubblica
      - **`authorId` reso opzionale, admin crea bottege senza account collegato (2026-08-01)**:
        richiesta esplicita di Dario — l'admin raccoglie i dati da un titolare non ancora iscritto
        e crea la pagina lui stesso, senza dover prima far registrare quella persona. Migration
        `20260801150944_shop_optional_author`: `Shop.authorId`/`author` diventano opzionali
        (`String? @unique` — più righe con `authorId NULL` restano ammesse da Postgres, il vincolo
        "una bottega per utente" si applica solo a quelle collegate) e aggiunto `Shop.ownerName`
        (nome libero, usato per "Gestita da" finché non c'è un account collegato: la risoluzione è
        `shop.author?.name ?? shop.ownerName` in `app/botteghe/[slug]/page.tsx`, e il blocco
        "Gestita da" ora non renderizza affatto se sono entrambi assenti — capita solo su righe
        create prima di questa modifica senza mai passare dal form, quindi mai in pratica)
      - Nuova pagina `/admin/botteghe/new` (pulsante "+ Nuova bottega" nella lista), stesso
        `ShopForm` esteso con due campi visibili solo in "adminMode" (attivato passando la prop
        `assignableUsers`, non un booleano a parte): "Nome del gestore" (`ownerName`) e "Utente
        collegato" (`<select>` — `authorId`, parsato a parte da `parseLinkedAuthorId` in
        `app/admin/(dashboard)/botteghe/actions.ts`, non fa parte di `shopSchema`/
        `parseShopFormData` perché è una relazione, non un campo di contenuto). Validazione
        applicativa (non nello zod schema, solo lato action): serve almeno uno tra `ownerName` e
        utente collegato, altrimenti "Gestita da" non avrebbe nulla da mostrare
      - `lib/shops.ts` → `getAssignableUsers(currentAuthorId?)`: esclude chi ha già una bottega
        collegata (`authorId` è `@unique`, un utente ne gestisce al massimo una), tranne l'utente
        già collegato alla bottega che si sta modificando (altrimenti sparirebbe dalla select
        mentre la si guarda). Effetto pratico verificato: un utente già collegato non compare più
        tra le opzioni per una bottega *nuova* — la select stessa previene il doppio collegamento,
        non solo il controllo server-side (`Prisma.PrismaClientKnownRequestError` con
        `code === "P2002"` → messaggio dedicato, difesa in profondità per un eventuale bypass)
      - `/admin/botteghe` (lista) e la pagina di modifica mostrano un avviso quando manca un
        account collegato (`shop.ownerName ... (nessun account collegato)`, colore ambra) per
        rendere visibile a colpo d'occhio quali bottege vanno ancora collegate
      - Testato end-to-end con Playwright: validazione (nessun nome né utente → errore) →
        creazione con solo `ownerName` → non richiede alcun account → pagina pubblica mostra
        "Gestita da" col nome libero e iniziali come avatar → un iscritto vero si registra →
        admin lo collega dalla select → pagina pubblica passa a mostrare nome (e foto, se
        presente) dell'account reale → l'iscritto già collegato non compare più tra gli
        assegnabili per una bottega nuova. Dati di test ripuliti dal DB di produzione dopo la
        verifica (compreso un residuo di un test di una sessione precedente, notato per caso in
        uno screenshot e ripulito a parte)
