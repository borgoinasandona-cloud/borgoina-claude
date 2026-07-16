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

// "from" usa il dominio sandbox di Resend finché il dominio del comitato non è verificato
// (vedi README.md — verifica SPF/DKIM prima di andare live).
const FROM_ADDRESS = "Sito Borgo INA <onboarding@resend.dev>";

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
