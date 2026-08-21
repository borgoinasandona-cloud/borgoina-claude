import { Resend } from "resend";
import { getAdminEmails } from "@/lib/users";
import { siteConfig } from "@/lib/site-config";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY non configurata");
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Dominio borgoinasandona.it verificato su Resend (SPF/DKIM) il 2026-07-27.
const FROM_ADDRESS = "Sito Borgo INA <noreply@borgoinasandona.it>";

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const to = process.env.CONTACT_EMAIL_TO;
  if (!to) {
    throw new Error("CONTACT_EMAIL_TO non configurata");
  }

  return getResendClient().emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: email,
    subject: `Nuovo messaggio dal sito da ${name}`,
    text: `Da: ${name} <${email}>\n\n${message}`,
  });
}

export async function sendVerificationEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  return getResendClient().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Conferma la tua email — Borgo INA San Donà",
    text: `Ciao ${name},\n\nper attivare il tuo account nella community del Borgo INA San Donà conferma il tuo indirizzo email cliccando su questo link (valido 24 ore):\n\n${url}\n\nSe non hai richiesto tu questa registrazione, ignora pure questa email.`,
  });
}

async function sendAdminNotification(subject: string, text: string) {
  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) return;

  return getResendClient().emails.send({
    from: FROM_ADDRESS,
    to: adminEmails,
    subject,
    text,
  });
}

export async function sendNewMemberNotification({ name, email }: { name: string; email: string }) {
  return sendAdminNotification(
    "Nuovo iscritto — Borgo INA San Donà",
    `Si è appena registrato un nuovo iscritto alla community:\n\n${name} <${email}>\n\nElenco iscritti: ${siteConfig.url}/soci`,
  );
}

export async function sendNewCommunityPostNotification({
  title,
  authorName,
}: {
  title: string;
  authorName: string;
}) {
  return sendAdminNotification(
    "Nuovo annuncio da approvare — Borgo INA San Donà",
    `${authorName} ha pubblicato un nuovo annuncio nel Mercatino, in attesa di approvazione:\n\n"${title}"\n\nModera da: ${siteConfig.url}/admin/community`,
  );
}

export async function sendNewShopNotification({
  shopName,
  ownerName,
}: {
  shopName: string;
  ownerName: string;
}) {
  return sendAdminNotification(
    "Nuova bottega creata — Borgo INA San Donà",
    `${ownerName} ha creato una nuova bottega:\n\n"${shopName}"\n\nGestisci da: ${siteConfig.url}/admin/botteghe`,
  );
}

export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  return getResendClient().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reimposta la password — Borgo INA San Donà",
    text: `Ciao ${name},\n\nabbiamo ricevuto una richiesta di reimpostazione della password per il tuo account. Clicca su questo link per scegliere una nuova password (valido 1 ora):\n\n${url}\n\nSe non hai richiesto tu questa operazione, ignora pure questa email: la password attuale resta invariata.`,
  });
}
