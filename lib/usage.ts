// KPI di utilizzo dei piani gratuiti (Cloudinary, Neon), mostrati in /admin. Ogni funzione
// ritorna null se le credenziali non sono configurate o se la chiamata fallisce — la dashboard
// semplicemente non mostra la card corrispondente, non deve mai rompere il resto della pagina per
// un servizio esterno irraggiungibile.

export type UsageMetric = {
  label: string;
  percent: number;
  detail: string;
  // Quando/se il conteggio si azzera — non è uguale per tutte le voci (vedi commenti sotto), va
  // sempre specificato esplicitamente invece di assumere "si azzera a fine mese" per tutto.
  resetInfo: string;
};

export type ServiceUsage = {
  service: string;
  planLabel: string;
  metrics: UsageMetric[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export async function getCloudinaryUsage(): Promise<ServiceUsage | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();

    const creditLimit = data.credits?.limit ?? 0;
    if (!creditLimit) return null;

    // Storage/banda/trasformazioni condividono lo stesso monte crediti: la percentuale di ciascuno
    // è "quota del budget totale consumata da questa voce", non un limite a sé stante.
    const asShareOfCredits = (creditsUsage: number) => (creditsUsage / creditLimit) * 100;

    // Sul piano Free (e sui piani self-service Plus/Advanced/Advanced Extra) Cloudinary NON azzera
    // banda e trasformazioni il 1° del mese: usa una finestra mobile di 30 giorni, l'attività di 31
    // giorni fa esce automaticamente ogni giorno. Lo storage invece è sempre un'istantanea del
    // momento, mai un conteggio che si azzera. Fonte: cloudinary.com/documentation/billing_and_plans
    const rollingWindowNote = "Finestra mobile di 30 giorni (non un mese fisso)";
    const snapshotNote = "Non si azzera — istantanea di quanto occupato ora";

    return {
      service: "Cloudinary",
      planLabel: data.plan ?? "Free",
      metrics: [
        {
          label: "Crediti totali",
          percent: data.credits?.used_percent ?? 0,
          detail: `${(data.credits?.usage ?? 0).toFixed(2)} / ${creditLimit} crediti`,
          resetInfo: "Storage: istantanea attuale · Banda/trasformazioni: finestra mobile 30gg",
        },
        {
          label: "Banda",
          percent: asShareOfCredits(data.bandwidth?.credits_usage ?? 0),
          detail: formatBytes(data.bandwidth?.usage ?? 0),
          resetInfo: rollingWindowNote,
        },
        {
          label: "Storage",
          percent: asShareOfCredits(data.storage?.credits_usage ?? 0),
          detail: formatBytes(data.storage?.usage ?? 0),
          resetInfo: snapshotNote,
        },
      ],
    };
  } catch {
    return null;
  }
}

// Limiti del piano Free non esposti dall'API di progetto Neon (solo l'uso effettivo lo è) — vedi
// https://neon.com/faqs/free-plan-limits-and-quotas. Se cambiano andranno aggiornati qui a mano.
const NEON_FREE_COMPUTE_CU_HOURS = 100;
const NEON_FREE_DATA_TRANSFER_BYTES = 5 * 1024 * 1024 * 1024;
const NEON_FREE_STORAGE_BYTES_FALLBACK = 512 * 1024 * 1024;

export async function getNeonUsage(): Promise<ServiceUsage | null> {
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID;
  if (!apiKey || !projectId) return null;

  try {
    const res = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const project = data.project;
    if (!project) return null;

    // compute_time_seconds è già in CU-secondi (un endpoint a 2 CU per 1s = 2 CU-secondi), non
    // secondi di orologio — va diviso per 3600 per ottenere le CU-ore del piano Free.
    const computeCuHours = (project.compute_time_seconds ?? 0) / 3600;
    const storageUsedBytes = project.synthetic_storage_size ?? 0;
    const storageLimitBytes = project.branch_logical_size_limit_bytes ?? NEON_FREE_STORAGE_BYTES_FALLBACK;
    const dataTransferBytes = project.data_transfer_bytes ?? 0;

    // A differenza di Cloudinary, Neon usa un vero ciclo mensile fisso: compute e trasferimento
    // dati si azzerano entrambi a consumption_period_end (il progetto lo espone direttamente,
    // niente da indovinare). Lo storage invece resta un'istantanea, come su Cloudinary.
    const periodEnd = project.consumption_period_end ? new Date(project.consumption_period_end) : null;
    const resetDateLabel = periodEnd
      ? `Si azzera il ${new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(periodEnd)}`
      : "Si azzera a inizio ciclo di fatturazione";
    const snapshotNote = "Non si azzera — istantanea di quanto occupato ora";

    return {
      service: "Neon",
      planLabel: project.owner?.subscription_type === "free_v3" ? "Free" : (project.owner?.subscription_type ?? "—"),
      metrics: [
        {
          label: "Compute",
          percent: (computeCuHours / NEON_FREE_COMPUTE_CU_HOURS) * 100,
          detail: `${computeCuHours.toFixed(1)} / ${NEON_FREE_COMPUTE_CU_HOURS} CU-ore`,
          resetInfo: resetDateLabel,
        },
        {
          label: "Storage",
          percent: (storageUsedBytes / storageLimitBytes) * 100,
          detail: `${formatBytes(storageUsedBytes)} / ${formatBytes(storageLimitBytes)}`,
          resetInfo: snapshotNote,
        },
        {
          label: "Trasferimento dati",
          percent: (dataTransferBytes / NEON_FREE_DATA_TRANSFER_BYTES) * 100,
          detail: `${formatBytes(dataTransferBytes)} / ${formatBytes(NEON_FREE_DATA_TRANSFER_BYTES)}`,
          resetInfo: resetDateLabel,
        },
      ],
    };
  } catch {
    return null;
  }
}
