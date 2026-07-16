import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
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
