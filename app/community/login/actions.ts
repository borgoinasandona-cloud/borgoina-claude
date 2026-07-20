"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type CommunityLoginState = {
  error?: string;
};

export async function communityLoginAction(
  _prevState: CommunityLoginState,
  formData: FormData,
): Promise<CommunityLoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/community",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenziali non valide." };
    }
    throw error;
  }
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/community" });
}
