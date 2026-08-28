import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// File di convenzione Next.js: genera automaticamente /manifest.webmanifest e il <link
// rel="manifest"> in ogni pagina, nessun collegamento manuale necessario (stesso meccanismo di
// app/icon.jpg per la favicon). Icone rigenerate da public/logo/icon-app.jpg (750×750, fornita da
// Dario appositamente per l'icona app — sfondo pieno bordo a bordo, soggetto centrato con margine
// dai bordi, pensata per il ritaglio "maskable") via sharp, 192/512px richiesti da Chrome per
// considerare il sito "installabile" (altrimenti l'evento beforeinstallprompt non scatta mai,
// vedi components/InstallAppButton.tsx).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Borgo INA",
    description: `Sito del comitato di quartiere ${siteConfig.name}`,
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f4",
    theme_color: "#b54a2a",
    // Ogni icona compare due volte, con purpose "any" e "maskable" separati (il tipo Manifest di
    // Next accetta un solo valore per entry, non la forma "any maskable" spaziata pure ammessa
    // dalla spec — due entry con lo stesso src sono equivalenti e valide). Senza "maskable"
    // Android non sa che l'artwork riempie già tutto il riquadro (mattoni bordo a bordo) e per
    // sicurezza rimpicciolisce l'icona dentro una "safe zone", riempiendo il resto con uno sfondo
    // bianco — il "bordo bianco intorno all'icona" segnalato dopo l'installazione su Android. Con
    // "maskable" dichiarato, Android applica direttamente la propria maschera (cerchio/goccia/
    // ecc.) all'immagine intera, senza aggiungere padding: lo sfondo a mattoni arriva davvero a
    // riempire tutta l'icona.
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
