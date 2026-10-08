import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Pagina rinominata il 2026-10-08 (era /come-funzionano-gli-sconti): redirect permanente per
      // chi ha salvato/condiviso il vecchio link o per l'indicizzazione Google già fatta — i link
      // interni al sito puntano già direttamente alla nuova rotta, non passano da qui.
      {
        source: "/come-funzionano-gli-sconti",
        destination: "/come-funzionano-i-token",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
