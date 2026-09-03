---
paths:
  - "components/RichTextEditor.tsx"
  - "components/HtmlContent.tsx"
  - "lib/cloudinary*.ts"
  - "app/api/upload/**"
---

# Contenuto HTML e immagini

- Contenuto di `Page`/`Post` è **HTML**, non Markdown: editor WYSIWYG (Tiptap) in admin
  (`components/RichTextEditor.tsx`), reso in pubblico via `components/HtmlContent.tsx` che sanitizza
  con `sanitize-html` prima di `dangerouslySetInnerHTML` — non renderizzare mai HTML da DB senza
  passare da lì
- **Niente `isomorphic-dompurify`/jsdom lato server**: ha rotto pagine pubbliche in produzione su
  Vercel (500) pur passando build/lint/tsc e `next start` locale — il bundling serverless di Vercel
  non include correttamente le dipendenze dinamiche di jsdom. Usare `sanitize-html` (puro JS,
  nessuna dipendenza nativa/jsdom) per qualunque sanitizzazione HTML lato server, e testare sempre
  con un deploy reale prima di considerarla verificata — `next build`/`next start` locali non
  bastano a intercettare questa classe di bug
- Immagini: caricare sempre su Cloudinary, mai servire da `/public` per contenuti gestiti da CMS
- Upload immagini: sempre tramite lo stesso upload firmato Cloudinary condiviso
  (`/api/upload/sign`, `lib/cloudinary.ts`), mai un endpoint nuovo per feature diverse
- Foto della Bacheca/gallerie: quelle fornite da Dario provengono dal sito attuale (spesso già
  ridimensionate) — se ci sono dubbi sulla risoluzione, segnalarlo invece di procedere assumendo
  che vadano bene
