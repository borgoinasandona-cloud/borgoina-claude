"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { CloseIcon } from "@/components/MenuIcons";

// Chrome/Edge/Android espongono l'evento beforeinstallprompt, che permette di mostrare un
// bottone e attivare il prompt nativo a comando. Safari/iOS non ha questa API — non esiste modo
// programmatico per far comparire "Aggiungi a Home": l'unica cosa possibile è mostrare istruzioni
// (Condividi → Aggiungi alla schermata Home). Il tipo non è nel DOM lib standard di TypeScript.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// isIOS e isStandalone leggono window/navigator, non disponibili in SSR: stesso pattern già usato
// in components/Header.tsx per "mounted" (useSyncExternalStore invece di un useEffect con un
// setState sincrono nel corpo, che React/il progetto segnalano come impuro — vedi CLAUDE.md).
function subscribeNoop() {
  return () => {};
}
function getIOSSnapshot() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
function getFalse() {
  return false;
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getStandaloneSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// wrapperClassName si applica solo al contenitore che avvolge bottone (+ eventuale modale iOS):
// tenerlo separato dallo stile del bottone stesso evita che un div "orfano" (bordo/margine del
// wrapper, passato dal chiamante) resti visibile quando il componente non ha nulla da mostrare —
// return null qui sotto è sull'intero wrapper, non solo sul bottone.
export function InstallAppButton({ wrapperClassName }: { wrapperClassName: string }) {
  const isIOS = useSyncExternalStore(subscribeNoop, getIOSSnapshot, getFalse);
  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getFalse);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Già installata (aperta come app standalone): nessun bottone da mostrare.
  if (isStandalone) return null;
  // Non installabile qui e non iOS (desktop, o Android senza il prompt ancora pronto): niente da fare.
  if (!deferredPrompt && !isIOS) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowIOSHelp(true);
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-sm font-semibold tracking-[0.08em] text-cream uppercase shadow-sm transition-colors hover:bg-ink-soft"
      >
        <FontAwesomeIcon icon={faDownload} className="!h-5 !w-5" aria-hidden="true" />
        Installa l&apos;app
      </button>

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="relative max-w-xs rounded-xl bg-white p-6 text-center shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIOSHelp(false)}
              aria-label="Chiudi"
              className="absolute top-3 right-3 text-ink-soft transition-colors hover:text-brick"
            >
              <CloseIcon className="!h-5 !w-5" />
            </button>
            <p className="font-display text-lg font-bold text-ink">Aggiungi alla schermata Home</p>
            <p className="mt-2 text-sm text-ink-soft">
              Tocca <strong>Condividi</strong>{" "}
              (l&apos;icona con la freccia verso l&apos;alto) nella barra di Safari, poi scegli{" "}
              <strong>&quot;Aggiungi alla schermata Home&quot;</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
