"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type CommunityLoginState = {
  error?: string;
  // Popolato solo quando l'errore è "email non verificata": la UI usa questo per mostrare
  // il pulsante di rinvio precompilato invece del generico messaggio di credenziali errate.
  unverifiedEmail?: string;
};

export async function communityLoginAction(
  _prevState: CommunityLoginState,
  formData: FormData,
): Promise<CommunityLoginState> {
  const email = formData.get("email");
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: "/community",
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

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/community" });
}
