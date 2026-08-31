import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations";
import { sendNewMemberNotification } from "@/lib/resend";

// Sottoclasse dedicata (invece del generico CredentialsSignin) così le action che chiamano
// signIn() possono distinguere "email non verificata" da "credenziali sbagliate" leggendo
// error.code, e proporre il rinvio dell'email di verifica invece di un errore generico.
export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    // Scatta solo per gli utenti creati dall'adapter, cioè il flusso OAuth (Google): la
    // registrazione Credentials crea l'utente direttamente con prisma.user.create() in
    // app/community/register/actions.ts, non passa mai dall'adapter, e invia già lì la propria
    // notifica — nessun rischio di doppio invio per lo stesso utente.
    //
    // L'intero corpo è dentro un try/catch (non solo la chiamata a sendNewMemberNotification):
    // Auth.js chiama `await events.createUser?.({ user })` direttamente dentro il flusso di
    // login OAuth (vedi @auth/core/lib/actions/callback/handle-login.js) — qualunque eccezione
    // non catturata qui esce da questo handler, fa fallire l'intero login e Auth.js la mostra
    // come "Configuration" generico (qualsiasi errore non riconosciuto nella pipeline diventa
    // quel messaggio, vedi @auth/core/index.js). L'utente viene comunque creato sul DB
    // dall'adapter PRIMA che questo handler giri, quindi un errore qui fa apparire un login
    // fallito anche se l'account esiste già — un socio che si registra da capo si troverebbe
    // "email già in uso". Bug reale segnalato da Dario in produzione, corretto rendendo l'intero
    // handler a prova di eccezioni.
    async createUser({ user }) {
      try {
        if (!user.email) return;
        await sendNewMemberNotification({ name: user.name ?? "Socio", email: user.email });
      } catch (error) {
        console.error("Notifica admin nuovo iscritto (Google) fallita:", error);
      }
    },
  },
  providers: [
    // Nomi env storici del progetto (GOOGLE_CLIENT_ID/SECRET, non AUTH_GOOGLE_ID/SECRET):
    // niente auto-inferenza di Auth.js v5, vanno passati esplicitamente.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordValid) return null;

        // Gate solo per il login Credentials: gli utenti Google passano dal flusso OAuth,
        // che non tocca authorize(). Gli account creati prima di questa feature sono stati
        // marcati verificati con un backfill una tantum, quindi qui restano bloccati solo i
        // nuovi account che non hanno ancora cliccato il link ricevuto via email.
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
