import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// File di convenzione Next.js: genera automaticamente /manifest.webmanifest e il <link
// rel="manifest"> in ogni pagina, nessun collegamento manuale necessario (stesso meccanismo di
// app/icon.jpg per la favicon). Icone rigenerate da public/logo/borgo-icona.jpg via sharp,
// 192/512px richiesti da Chrome per considerare il sito "installabile" (altrimenti l'evento
// beforeinstallprompt non scatta mai, vedi components/InstallAppButton.tsx).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Borgo INA",
    description: `Sito del comitato di quartiere ${siteConfig.name}`,
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f4",
    theme_color: "#b54a2a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
