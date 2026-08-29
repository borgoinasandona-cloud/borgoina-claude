"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type CommunityLoginState = {
  error?: string;
  // Popolato solo quando l'errore è "email non verificata": la UI usa questo per mostrare
  // il pulsante di rinvio precompilato invece del generico messaggio di credenziali errate.
  unverifiedEmail?: string;
};

// Il callbackUrl arriva da un query param (?callbackUrl=...), quindi non è mai fidato: deve
// essere un percorso relativo interno al sito. Senza questo controllo un link tipo
// /community/login?callbackUrl=https://sito-malevolo.it porterebbe l'utente fuori dal sito subito
// dopo il login (open redirect) — "//host" è protocol-relative e sfugge al controllo "inizia con /".
function safeCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/community";
  }
  return callbackUrl;
}

export async function communityLoginAction(
  callbackUrl: string | undefined,
  _prevState: CommunityLoginState,
  formData: FormData,
): Promise<CommunityLoginState> {
  const email = formData.get("email");
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: safeCallbackUrl(callbackUrl),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if ((error as { code?: string }).code === "email-not-verified") {
        return {
          error: "Devi confermare la tua email prima di accedere.",
          unverifiedEmail: typeof email === "string" ? email : undefined,
        };
      }
      return { error: "Credenziali non valide." };
    }
    throw error;
  }
}

export async function signInWithGoogleAction(callbackUrl: string | undefined) {
  await signIn("google", { redirectTo: safeCallbackUrl(callbackUrl) });
}
