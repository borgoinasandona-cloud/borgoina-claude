# Fase 7 — RSVP eventi

- [x] **Fase 7 — Sistema RSVP nativo per eventi (2026-08-27)**: prima applicazione, la prossima
      cena di quartiere. Verificato prima di procedere che non esistesse già nulla di simile: gli
      "eventi" nel progetto erano solo `Post` con `Category` "Eventi" nella Bacheca news — puro
      contenuto editoriale, senza data strutturata né alcuna nozione di prenotazione. Nessun
      aggancio possibile, servivano modelli nuovi indipendenti da `Post`. Piano e diff schema
      mostrati e approvati prima di scrivere codice (vedi PLANNING.md "Fase 7" per il riassunto)
      - Schema: `Event` (titolo, descrizione, data/ora, `notesLabel` opzionale) e `EventRsvp`
        (`@@unique([eventId, userId])` — un socio prenota un evento una sola volta, la stessa riga
        si aggiorna con un `upsert` per "modifica prenotazione"). Aggiunti rispetto alla bozza
        iniziale, per coerenza con `Post`/`CommunityPost`/`Shop`: `Event.slug` (URL pubblica
        leggibile, mai un cuid nudo), `@db.Text` sui campi di testo lunghi, `updatedAt`.
        **Deliberatamente senza `visibility`**: confermato con Dario in fase di piano — nessuna
        pagina di elenco pubblico per ora (solo `/eventi/[slug]` via link diretto condiviso a mano,
        nessuna voce di menù), quindi niente da filtrare. Aggiungibile in futuro insieme a un
        eventuale elenco
      - **`maxSeats` rimosso il 2026-08-27, subito dopo il rilascio iniziale**: la prima versione
        aveva un limite posti opzionale (`Event.maxSeats`) con un row lock esplicito
        (`SELECT ... FOR UPDATE`, stesso pattern di `lib/discounts.ts` → `redeemToken()` della
        Fase 6) per garantirlo sotto prenotazioni concorrenti — **tolto su richiesta esplicita**:
        nessun limite posti per gli eventi, `guests` (accompagnatori) resta ma ristretto da
        `min(0).max(20)` a `min(0).max(5)`. Migration additiva (`event_remove_max_seats`) applicata
        subito su Neon prod. `lib/eventRsvp.ts` → `createOrUpdateRsvp()` è tornato un `upsert`
        semplice fuori da transazione: senza un limite da proteggere, l'unicità "una prenotazione
        per socio" garantita dal vincolo `@@unique` basta da sola, nessun lock necessario. Rimossi
        di conseguenza: il messaggio "Posti esauriti" e il contatore posti nella pagina pubblica,
        il campo `maxSeats` dal form admin e da `eventSchema`, il conteggio "posti occupati/totali"
        nella lista/tabella admin (sostituito con un semplice conteggio "N prenotazioni",
        `_count.rsvps` invece di sommare `1 + guests` su tutte le righe)
      - Pagina pubblica `/eventi/[slug]`: stato dinamico in un'unica pagina — non loggato (invito
        al login), loggato senza prenotazione (form), loggato già prenotato (banner + stesso form
        precompilato per modificare + bottone "Annulla prenotazione" separato), evento passato
        (stato di sola lettura, form sempre assente indipendentemente da prenotazione esistente o
        meno — coerente con "si può modificare finché l'evento non è passato")
      - Etichetta del campo note: `event.notesLabel` se valorizzato dall'admin (es. "Preferenze
        menù" per la cena), altrimenti placeholder generico "Note per l'organizzatore
        (opzionale)" — il campo in sé resta generico (`EventRsvp.notes`), non specifico per
        preferenze alimentari, come richiesto
      - **Attenzione al fuso orario nell'input `datetime-local` del form admin**: una stringa
        "YYYY-MM-DDTHH:mm" non porta alcuna informazione di fuso orario. `new Date(...)` la
        interpreta come orario locale del runtime che esegue il codice — se quel valore venisse poi
        ri-formattato con un `timeZone` esplicito diverso (es. forzando `"Europe/Rome"` in
        `Intl.DateTimeFormat`), l'orario mostrato in pubblico si sfaserebbe rispetto a quanto
        digitato dall'admin. Scelta deliberata: **nessun `timeZone` esplicito da nessuna parte**
        (né alla creazione in `app/admin/(dashboard)/eventi/actions.ts`, né alla visualizzazione in
        `app/eventi/[slug]/page.tsx`, né alla ri-lettura per il form di modifica in
        `components/EventForm.tsx`, che usa i getter locali `getFullYear()`/`getHours()` ecc. e non
        `.toISOString()`, sempre UTC) — così l'orario digitato e quello mostrato ai soci coincidono
        sempre "alla lettera", per costruzione, qualunque sia il fuso orario reale del server.
        Non adatto a un pubblico multi-fuso, ma sufficiente per un comitato di quartiere locale;
        commentato nel codice per non perdere il ragionamento in futuro
      - Admin: nuovo gruppo "Eventi" in `adminNav` (`app/admin/(dashboard)/layout.tsx`), CRUD in
        `/admin/eventi` (lista/nuovo/modifica, stesso impianto di `/admin/botteghe`) e tabella
        prenotazioni dedicata in `/admin/eventi/[id]/rsvps` — **nome, email, ospiti e note sempre
        visibili direttamente in cella**, mai dietro un dettaglio da espandere/aprire (richiesto
        esplicitamente: le note sono l'informazione operativa più usata da chi organizza)
      - Testato end-to-end con Playwright contro un dev server riavviato di fresco e dati reali
        (1 admin + 1 iscritto, ripuliti a fine test), riverificato dopo la rimozione di `maxSeats`:
        form admin senza più il campo posti massimi → admin crea evento dalla UI → pagina pubblica
        non menziona più "posti" da nessuna parte, il campo ospiti ha `max="5"` → utente anonimo
        vede invito al login senza form → iscritto prenota 3 accompagnatori → banner "sei
        prenotato" → modifica a 1 accompagnatore, poi di nuovo a 2 in una terza prenotazione
        consecutiva: sempre `count === 1` in `EventRsvp` (l'`upsert` aggiorna la stessa riga, mai
        duplica) → admin apre `/admin/eventi/[id]/rsvps`, le note restano visibili direttamente in
        tabella e il riepilogo mostra "N prenotazioni" invece di "posti occupati" → stesso
        conteggio nella lista `/admin/eventi` → evento con data nel passato mostra stato di sola
        lettura, form assente. **Rimosso il test di concorrenza su `maxSeats: 1`** (non più
        applicabile, nessun limite da proteggere). Dati di test ripuliti dal DB di produzione dopo
        la verifica (controllato con una query mirata a fine sessione: zero eventi e zero utenti di
        test residui)
- [x] **Etichetta campo ospiti nel form RSVP eventi (2026-08-31)**: `components/EventRsvpForm.tsx`,
      "Accompagnatori" → "Quante persone porti" (più diretto per chi compila il form). Non toccati
      i due punti di `app/eventi/[slug]/page.tsx` dove "accompagnatore/i" compare come riepilogo
      testuale ("Sei prenotato — N accompagnatori", "Eri prenotato con N accompagnatori") — sono
      frasi di riepilogo, non l'etichetta del campo, e la richiesta era specifica sul form.
      Verificato con Playwright login reale (admin) + apertura di un evento reale in produzione: il
      form mostra "Quante persone porti" al posto di "Accompagnatori". `tsc`/`eslint` puliti, nessun
      dato di test creato (solo login e visualizzazione, nessun RSVP inviato), file temporanei
      ripuliti
