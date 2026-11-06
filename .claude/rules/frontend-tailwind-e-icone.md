---
paths:
  - "**/*.tsx"
---

# Frontend, Tailwind e icone

- **Cascata CSS in `app/globals.css`**: regole "semplici" (fuori da `@layer`) battono sempre le
  utility Tailwind di `@layer utilities`, indipendentemente dall'ordine nel markup. Se una utility
  Tailwind sembra "non applicarsi", controllare prima le regole non-layered in globals.css
- **FontAwesome** (`fontawesome-svg-core/styles.css`) è anch'esso non-layered e ignora le classi
  `h-*`/`w-*` di Tailwind sulle icone: serve il prefisso `!` (es. `!h-6 !w-6`) per vincere sempre,
  indipendentemente da ordine/duplicazioni della regola
- **SWC/Turbopack** tronca lo spazio iniziale della prima riga di un nodo di testo JSX multi-riga
  dopo un elemento inline (`</span>`, `</Link>`, ecc.) — usare sempre `{" "}` esplicito, mai contare
  su uno spazio letterale a inizio riga
- Regola eslint **`react-hooks/purity`**: vieta `Date.now()` e `setState` sincrono dentro un effect
  (anche in Server Component) — usare `new Date()` al posto di `Date.now()`, e
  `useSyncExternalStore` invece di `useState`+`useEffect` per leggere `window`/`navigator`
- Le pagine di dettaglio pubbliche condividono lo stile "scheda unica" (header senza sfondo/bordo
  separato dal corpo — vedi [Header, menu e icone](../../docs/fasi/header-menu-e-icone.md))
- **Il breakpoint custom `wide`** (`--breakpoint-wide` in `app/globals.css`, soglia 1570px per i
  monitor larghi) va dichiarato **in `rem`, mai in `px`**: Tailwind ordina le varianti responsive
  assumendo la stessa unità di misura dei breakpoint di default (`sm/md/lg/xl/2xl`, tutti in rem) —
  un valore in px rompe silenziosamente l'ordinamento e `wide:` perde sistematicamente contro
  `md:`/`lg:`/`xl:` quando competono sulla stessa proprietà, senza errori in console (bug reale
  trovato e corretto il 2026-11-06, era così da quando il breakpoint esiste). Se un giorno serve
  un altro breakpoint custom, stessa regola: sempre rem, mai px
