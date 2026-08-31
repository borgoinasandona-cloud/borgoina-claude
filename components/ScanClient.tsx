"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { verifyAndListTokensAction, redeemTokenAction, type ScanResult } from "@/app/scan/actions";

const READER_ELEMENT_ID = "qr-reader";

type ViewState =
  | { step: "scanning" }
  | { step: "checking" }
  | { step: "result"; data: Extract<ScanResult, { status: "ok" }> }
  | { step: "error"; message: string }
  | { step: "redeemed"; title: string; customerName: string };

export function ScanClient() {
  const [state, setState] = useState<ViewState>({ step: "scanning" });
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (state.step !== "scanning") return;

    const scanner = new Html5QrcodeScanner(
      READER_ELEMENT_ID,
      { fps: 10, qrbox: 240, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false,
    );

    scanner.render(
      (decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;

        scanner
          .clear()
          .catch(() => {})
          .finally(async () => {
            setState({ step: "checking" });
            const result = await verifyAndListTokensAction(decodedText);
            processingRef.current = false;
            setState(
              result.status === "error"
                ? { step: "error", message: result.message }
                : { step: "result", data: result },
            );
          });
      },
      () => {
        // Nessun QR nell'inquadratura in questo frame: normale, non è un errore da mostrare.
      },
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [state.step]);

  async function handleRedeem(tokenId: string, title: string, customerId: string, customerName: string) {
    setRedeemingId(tokenId);
    const result = await redeemTokenAction(tokenId, customerId);
    setRedeemingId(null);

    if (result.status === "error") {
      setState({ step: "error", message: result.message });
      return;
    }
    setState({ step: "redeemed", title, customerName });
  }

  if (state.step === "scanning") {
    return <div id={READER_ELEMENT_ID} />;
  }

  if (state.step === "checking") {
    return <p className="text-sm text-ink-soft">Verifica in corso…</p>;
  }

  if (state.step === "error") {
    return (
      <div>
        <p className="text-sm font-medium text-brick-dark">{state.message}</p>
        <button
          type="button"
          onClick={() => setState({ step: "scanning" })}
          className="mt-4 rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream hover:bg-brick-dark"
        >
          Scansiona di nuovo
        </button>
      </div>
    );
  }

  if (state.step === "redeemed") {
    return (
      <div>
        <p className="text-sm text-ink-soft">
          Offerta <span className="font-semibold text-ink">&quot;{state.title}&quot;</span> assegnata a{" "}
          <span className="font-semibold text-ink">{state.customerName}</span>.
        </p>
        <button
          type="button"
          onClick={() => setState({ step: "scanning" })}
          className="mt-4 rounded bg-brick px-4 py-2.5 text-sm font-semibold text-cream hover:bg-brick-dark"
        >
          Scansiona un altro
        </button>
      </div>
    );
  }

  // state.step === "result"
  const { customerName, customerId, tokens } = state.data;
  return (
    <div>
      <p className="text-sm text-ink-soft">
        Socio: <span className="font-semibold text-ink">{customerName}</span>
      </p>
      {tokens.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Nessuna offerta disponibile al momento per questa bottega.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {tokens.map((token) => (
            <li key={token.id}>
              <button
                type="button"
                disabled={redeemingId !== null}
                onClick={() => handleRedeem(token.id, token.title, customerId, customerName)}
                className="flex w-full items-start justify-between gap-3 rounded border border-ink/15 px-4 py-2.5 text-left text-sm transition-colors hover:border-brick hover:text-brick disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{token.title}</span>
                  {token.description && (
                    <span className="mt-0.5 block text-xs font-normal text-ink-soft">{token.description}</span>
                  )}
                </span>
                <span className="font-mono shrink-0 text-xs text-ink-soft">{token.remaining} rimasti</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setState({ step: "scanning" })}
        className="mt-4 text-sm font-semibold text-ink-soft hover:text-brick-dark"
      >
        Annulla e scansiona di nuovo
      </button>
    </div>
  );
}
