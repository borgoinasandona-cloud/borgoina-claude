import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  // Non più solo ADMIN: anche i soci loggati caricano immagini (cover dei loro annunci community).
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const signature = createUploadSignature();
    return NextResponse.json(signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore imprevisto" },
      { status: 500 },
    );
  }
}
