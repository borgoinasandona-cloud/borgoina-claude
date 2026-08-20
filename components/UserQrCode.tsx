export function UserQrCode({ dataUrl }: { dataUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded border border-ink/20 bg-cream p-4 shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Codice QR identificativo del tuo account" className="h-40 w-40" />
      </div>
      <p className="text-center text-xs text-ink-soft">Il tuo codice identificativo personale</p>
    </div>
  );
}
