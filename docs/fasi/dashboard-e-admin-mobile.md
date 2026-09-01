# Dashboard admin e ottimizzazione mobile

- [x] **Dashboard admin: nuovi blocchi statistiche (2026-08-27)**: sostituiti i 4 blocchi originali
      (Articoli Bacheca/Pagine/Categorie/Messaggi contatto) con 5 nuovi, su richiesta: Utenti, Nuovi
      utenti (24h), Botteghe, Nuove botteghe (24h), Annunci in approvazione (`CommunityPost` con
      `visibility: PENDING`). Le finestre "ultime 24h" usano `new Date()` + `setHours(-24)`, non
      `Date.now() - ...`: il progetto ha una regola eslint (`react-hooks/purity`) che segnala
      `Date.now()` come chiamata impura anche in un Server Component — `new Date()` (già usato
      altrove nel progetto, es. i controlli "evento passato" della Fase 7) non viene invece
      segnalato. **Promemoria per il futuro**: preferire `new Date()` a `Date.now()` in questo
      progetto per evitare l'errore di lint, anche se semanticamente equivalenti. Verificato con
      Playwright confrontando i numeri renderizzati con una query diretta sullo stesso DB
      (coincidenti esattamente) usando un admin di test poi ripulito
- [x] **Ottimizzazione menù admin per mobile (2026-08-27)**:
      - "Eventi" (era un gruppo a sé nel nav admin, con un solo link) spostato dentro il gruppo
        "Community" insieme a Mercatino/Botteghe — tre voci correlate (contenuti generati dagli
        iscritti) in un solo gruppo invece di un gruppo con una voce sola
      - Nav admin estratto in un componente client dedicato, `components/AdminNav.tsx`: su schermi
        `sm`+ si comporta esattamente come prima (lista sempre visibile), sotto `sm` diventa una
        tendina — un bottone "Menu" che mostra/nasconde la lista di link, chiusa di default e
        richiusa automaticamente al cambio pagina (stesso pattern "adjust state during render" già
        usato in `components/Header.tsx` per il menu mobile pubblico, non un `useEffect` con un
        solo `setState` dentro)
      - **Rifinitura estetica della tendina mobile, su richiesta esplicita ("fai un po più carino
        il drop down menù")**: il bottone "Menu" era testo nudo — ora è un vero bottone
        (`border`/`rounded-md`/`shadow-sm`, coerente con lo stile neutro già in uso nel resto
        dell'admin) con un'icona SVG a freccia che ruota 180° all'apertura (`transition-transform`)
        al posto dei caratteri unicode ▲/▼ originali (resa meno uniforme tra font/piattaforme). Il
        pannello espanso è diventato una vera card (`border`/`rounded-md`/`shadow-sm`/`bg-white`/
        `p-4`), con più respiro tra i gruppi (`gap-4` invece di `gap-3` compresso) — questo styling
        da "card" è applicato solo sotto `sm` (override esplicito a `sm:border-0 sm:bg-transparent
        sm:shadow-none sm:p-0`), il nav desktop resta piatto/invariato come prima, non era in scope
        la richiesta. **Aggiunta anche l'evidenziazione della voce attiva** (non richiesta
        esplicitamente ma naturale per "più carino" — aiuta l'orientamento): il link della pagina
        corrente diventa `font-semibold text-green-700` invece del colore neutro, calcolato
        confrontando `pathname` con l'`href` di ogni voce (match esatto solo per "Dashboard"
        `/admin`, altrimenti `startsWith` per non richiedere match esatto sulle sotto-pagine, es.
        `/admin/botteghe/[id]/edit` evidenzia comunque "Botteghe"), attiva sia in versione mobile
        che desktop
      - **Indentazione della tendina mobile per evidenziare la gerarchia**: i link di ogni gruppo
        erano allo stesso margine sinistro dell'etichetta del gruppo, leggibile come una lista
        piatta invece che come un albero. Aggiunto `pl-3` al contenitore dei link di ogni gruppo
        (solo sotto `sm`, resettato a `sm:pl-0` per non toccare il layout orizzontale desktop, dove
        la gerarchia è già resa dai separatori verticali tra gruppi) — "Dashboard", unico link di
        primo livello senza gruppo, resta non indentato, coerente col suo ruolo di radice
        dell'albero. Verificato misurando le coordinate X reali (etichetta gruppo vs link figlio)
        via Playwright, non solo a occhio da uno screenshot
      - **Header pubblico più basso in `/admin`**: essendo condiviso da tutte le rotte (nessun
        layout separato per l'area admin — vedi la nota più sopra sulla cascata CSS/body condiviso),
        su mobile la sua altezza normale si sommava a quella del nav admin sotto, occupando troppo
        spazio verticale. `components/Header.tsx` rileva `pathname.startsWith("/admin")` e in quel
        caso usa padding verticale ridotto (`py-2` invece di `py-4`) e un logo più piccolo e a
        dimensione fissa (`h-8` invece di `h-11 md:h-14 wide:h-16` — in admin non serve scalare per
        breakpoint, non è una pagina di marketing). Icone QR/avatar/hamburger invariate, restano
        utili anche in admin (link rapido al sito pubblico, propria tessera). Verificato con
        Playwright: altezza header in `/admin` (mobile) 49px contro 77px nelle pagine pubbliche
      - Testato con Playwright e un admin di test: nav desktop invariato con "Eventi" sotto
        "Community", tendina mobile chiusa di default e correttamente espandibile, header più basso
        misurato numericamente (non solo a occhio). Dati di test ripuliti
- [x] **KPI di utilizzo piani gratuiti in dashboard admin (2026-08-27)**: card "Utilizzo piani
      gratuiti" in `/admin` per Cloudinary e Neon (percentuale reale contro i limiti del piano
      Free, non stimata) — **Vercel deliberatamente escluso**: l'endpoint di billing/usage
      (`GET /v1/billing/charges`, individuato leggendo la documentazione REST ufficiale) risponde
      `"Plan not found"` per un team su piano Hobby — l'accesso ai dati di utilizzo via API è
      riservato a Pro/Enterprise, nessun formato di richiesta diverso lo sblocca. Confermato con
      Dario di ometterlo dalla dashboard invece di mostrare un placeholder vuoto
      - `lib/usage.ts` (nuovo): `getCloudinaryUsage()` (Admin API `/usage` di Cloudinary, già
        verificata via `curl` prima di scrivere codice) e `getNeonUsage()` (Neon Management API,
        `GET /v2/projects/{id}`). Entrambe ritornano `null` — mai un errore che rompe la pagina —
        se le credenziali mancano o la chiamata fallisce (verificato esplicitamente con credenziali
        assenti e con credenziali invalide, in entrambi i casi `null` pulito, non un'eccezione)
      - **Due nuove chiavi**: `NEON_API_KEY` (generata da Dario su console.neon.tech → progetto →
        Settings → API Keys — **scoped al progetto**, non all'account: `GET /v2/projects` senza id
        risponde infatti 404 "not allowed to perform actions outside the project this key is
        scoped to", il messaggio d'errore stesso rivela lo slug del progetto,
        `solitary-thunder-55089858`, usato per popolare `NEON_PROJECT_ID`) e `VERCEL_TOKEN`
        (generato ma non usato in codice, vedi sopra — lasciato in `.env` nel caso torni utile in
        futuro, es. se il piano venisse aggiornato a Pro)
      - **`compute_time_seconds` di Neon non è tempo di orologio**: è già in CU-secondi (un
        endpoint a 2 CU attivo per 1s conta 2, non 1) — verificato leggendo la documentazione
        ufficiale (neon.com/docs/introduction/usage-calculations) prima di scrivere la conversione,
        per non fidarsi di un'assunzione plausibile ma sbagliata. Va diviso per 3600 per ottenere le
        CU-ore consumate, confrontate con le 100 CU-ore/mese del piano Free (limite **non esposto
        dall'API di progetto** — solo l'uso effettivo lo è — quindi hardcoded in `lib/usage.ts` con
        link alla fonte, da aggiornare a mano se Neon lo cambia). Il limite di storage invece **è**
        esposto dall'API (`branch_logical_size_limit_bytes`), usato live invece di un valore fisso
      - Per Cloudinary, storage/banda/trasformazioni condividono lo stesso monte crediti del piano
        Free (25 crediti totali): la percentuale di ciascuna voce nella card è "quota del budget
        totale consumata da quella voce" (`credits_usage` della singola voce / `limit` totale), non
        un tetto indipendente — coerente con come Cloudinary stessa presenta il piano
      - Barra colorata per soglia (verde/ambra/rosso sotto 70%/70-90%/oltre 90%), stesso linguaggio
        cromatico già in uso altrove in admin (es. badge "Esauriti"/"Attivo" nei token sconto)
      - Card renderizzate solo se la funzione corrispondente ritorna dati (`.filter()` sui `null`):
        nessuna card vuota/rotta se una chiave manca o l'API è giù, la sezione intera sparisce se
        entrambe falliscono
      - **Le chiavi vanno aggiunte anche su Vercel (Environment Variables, Production)** perché la
        dashboard gira anche in produzione, non solo in locale — promemoria lasciato a Dario, non
        ancora fatto al momento di questa nota
      - Verificato con Playwright e un admin di test: sezione "Utilizzo piani gratuiti" presente,
        nessuna menzione di "Vercel" da nessuna parte della pagina, percentuali renderizzate
        coincidenti (arrotondamento a parte) con quelle lette direttamente dalle due API in una
        chiamata `curl`/script indipendente fatta prima di scrivere il componente. Dati di test
        ripuliti
      - **Specificato quando/se ogni voce si azzera (2026-08-27), su richiesta esplicita**: prima
        di scrivere il testo, verificato con la documentazione ufficiale invece di assumere "tutto
        si azzera a fine mese" — **falso per Cloudinary**. Aggiunto `UsageMetric.resetInfo` (una
        riga in più sotto ogni barra, testo `text-neutral-400`):
        - **Neon**: Compute e Trasferimento dati si azzerano davvero a data fissa, letta
          direttamente dal campo `consumption_period_end` dell'API (non calcolata a mano) — es.
          "Si azzera il 1 settembre 2026". Storage non si azzera mai (istantanea)
        - **Cloudinary**: **non esiste un azzeramento mensile fisso** per banda/trasformazioni sul
          piano Free — usa una finestra mobile di 30 giorni (l'attività di 31 giorni fa esce da sola
          ogni giorno), verificato su cloudinary.com/documentation/billing_and_plans dopo che una
          prima spiegazione a voce data a Dario ("si azzera ogni mese") si è rivelata imprecisa.
          Storage, come su Neon, non si azzera mai
      - Verificato con Playwright che il testo compaia per entrambi i servizi (`"Si azzera il"`,
        `"finestra mobile"`, `"istantanea"`), screenshot per la leggibilità. Dati di test ripuliti
