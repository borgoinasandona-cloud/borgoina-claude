# Pagina pubblica Soci / Iscritti

- [x] **Pagina pubblica "Soci" (2026-08-02)**: `/soci` (`app/soci/page.tsx`, `lib/users.ts` →
      `getPublicMembers()`, `components/MemberCard.tsx`), elenco di tutti gli iscritti — nessun
      login richiesto per vederla, coerente con Bacheca/Community/Botteghe che sono già pubbliche.
      Aggiunta inizialmente al menù come link semplice, poi spostata tra le pillole colorate lo
      stesso giorno — vedi la voce sulla ristrutturazione del menù più sotto
      - **Scelta deliberata sulla privacy**: `getPublicMembers()` non seleziona affatto l'email
        (non solo "non mostrata a video" — proprio non arriva dal DB), scelta di design fatta
        proattivamente senza che fosse richiesto esplicitamente: chi vuole essere contattato
        pubblicamente mette i propri contatti sulla pagina Botteghe, che restano una scelta
        esplicita dell'iscritto, non un dato esposto di default registrandosi
      - Ogni card mostra avatar (`User.image`) o iniziali, nome, "socio dal" mese/anno
        (`createdAt`), e — se l'iscritto ha una bottega con `visibility: PUBLIC` — un link alla sua
        pagina. Il filtro su `visibility` è fatto nel componente (`components/MemberCard.tsx`), non
        nella query: con una relazione 1:1 opzionale non è pulito esprimere "includi la bottega solo
        se pubblica" direttamente in Prisma
      - **Refactor collaterale**: la funzione `initials()` (iniziali da un nome, per l'avatar
        segnaposto) esisteva già duplicata identica in `components/AccountForm.tsx` e
        `app/botteghe/[slug]/page.tsx` — con questa pagina sarebbe diventata una terza copia,
        quindi estratta in `lib/initials.ts` e i due usi esistenti aggiornati per importarla
      - **Trovati e ripuliti due account di test residui** durante la verifica: la nuova pagina
        rende visibile a chiunque *qualunque* `User` esista, comprese righe che prima non
        comparivano da nessuna parte nel sito pubblico. Uno era un residuo di questa stessa sessione
        (`test-avatar-…@example.com`, dai test della foto profilo del 2026-07-30), l'altro un
        residuo già documentato di una sessione precedente (`debug-…@example.com`, citato nella
        voce sul backfill di `emailVerified` del 2026-07-30) — nessuno dei due era mai stato
        ripulito perché fino a questa pagina non c'era modo di notarli pubblicamente. **Promemoria
        per il futuro**: da qui in avanti qualunque utente di test creato per verifiche va ripulito
        subito a fine sessione, perché ora è immediatamente visibile su `/soci` finché non lo si fa
      - **Nota lasciata aperta, non decisa qui**: l'account admin (`role: ADMIN`) compare nella
        lista come chiunque altro (nessun filtro per ruolo) — scelta non esplicitamente richiesta,
        segnalata a Dario ma non cambiata di default
      - Testato end-to-end con Playwright: la pagina carica contenuti reali di produzione, un
        iscritto con bottega pubblica mostra il link, un nuovo iscritto compare subito nell'elenco
        senza alcuna verifica/approvazione aggiuntiva e senza mostrare un link bottega (non ne ha
        una), iniziali mostrate quando manca una foto profilo. Dati di test ripuliti dopo la verifica
- [x] **Voce di menù "Soci" rinominata in "Iscritti" (2026-08-15)**: stessa etichetta cambiata sia
      in `lib/site-config.ts` (`navLinks`) sia nel titolo effettivo della pagina (`app/soci/page.tsx`
      → `metadata.title` e `<h1>`, non solo il menù). Route invariata (resta `/soci`, stesso pattern
      già usato per "Community" → "Mercatino": rinominare l'etichetta non richiede rinominare anche
      URL/file/funzione). Non toccato apposta il resto del testo che usa "socio/soci" (es. "Socio dal
      ..." in `components/MemberCard.tsx`) — non richiesto, solo menù e titolo pagina
- [x] **Miglioramento layout `/soci` (2026-08-20)**: esteso il numero di colonne per la griglia degli iscritti da 3 a 4 a partire dal breakpoint desktop `lg` (`lg:grid-cols-4`)
