"use server";

import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/resend";
import { contactSchema } from "@/lib/validations";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        fieldErrors[key as keyof typeof fieldErrors] = issue.message;
      }
    }
    return { status: "error", fieldErrors, message: "Controlla i campi evidenziati." };
  }

  const { name, email, message } = parsed.data;

  await prisma.contactMessage.create({ data: { name, email, message } });

  try {
    await sendContactEmail({ name, email, message });
  } catch (error) {
    console.error("Invio email contatto fallito:", error);
    return {
      status: "error",
      message:
        "Il messaggio è stato salvato ma l'invio dell'email di notifica è fallito. Ti risponderemo comunque appena possibile.",
    };
  }

  return { status: "success", message: "Grazie, il tuo messaggio è stato inviato." };
}
