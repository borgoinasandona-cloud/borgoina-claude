// Setup richiesto da Font Awesome per Next.js: disabilita l'iniezione automatica del CSS
// (che avviene troppo tardi con l'App Router e causa un flash di icone giganti) e lo importa
// esplicitamente una sola volta qui. Importato per side-effect da app/layout.tsx.
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;
