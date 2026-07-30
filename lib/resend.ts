import { Resend } from "resend";

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
