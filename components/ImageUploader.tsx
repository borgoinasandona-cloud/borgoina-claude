"use client";

import { useState, type ChangeEvent } from "react";

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
};

const DEFAULT_LABEL_CLASS =
  "inline-flex cursor-pointer items-center rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50";

export function ImageUploader({
  onUploaded,
  label = "Carica immagine",
  labelClassName = DEFAULT_LABEL_CLASS,
}: {
  onUploaded: (result: CloudinaryUploadResult) => void;
  label?: string;
  labelClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const signRes = await fetch("/api/upload/sign", { method: "POST" });
      if (!signRes.ok) {
        const body = await signRes.json().catch(() => null);
        throw new Error(body?.error ?? "Firma upload non disponibile");
      }
      const { timestamp, signature, folder, apiKey, cloudName } = await signRes.json();

      if (!cloudName || !apiKey) {
        throw new Error("Cloudinary non configurato (variabili d'ambiente mancanti)");
      }

      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("api_key", apiKey);
      uploadForm.append("timestamp", String(timestamp));
      uploadForm.append("signature", signature);
      uploadForm.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload su Cloudinary fallito");
      }

      const result = await uploadRes.json();
      onUploaded({ publicId: result.public_id, secureUrl: result.secure_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={labelClassName}>
        {uploading ? "Caricamento…" : label}
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
