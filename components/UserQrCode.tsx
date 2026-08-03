export function UserQrCode({ dataUrl }: { dataUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-ink/10 bg-white p-6 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="Codice QR identificativo del tuo account" className="h-40 w-40" />
      <p className="text-center text-xs text-ink-soft">Il tuo codice identificativo personale</p>
    </div>
  );
}
