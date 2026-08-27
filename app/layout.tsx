import type { Metadata } from "next";
import { Big_Shoulders, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";
import { auth } from "@/lib/auth";
import { generateUserQrCode } from "@/lib/qr";

const bigShoulders = Big_Shoulders({
  variable: "--font-display",
  weight: ["700", "800", "900"],
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const defaultDescription = `Sito del comitato di quartiere ${siteConfig.name}`;
// Foto hero della home, usata come anteprima di default per le pagine senza una propria foto
// principale (l'og:image, non solo il favicon, che è quanto vedevano finora i link condivisi
// su WhatsApp/social prima di questa metadata).
const defaultOgImage = "/images/home/home-slide-borgo1.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "it_IT",
    title: siteConfig.name,
    description: defaultDescription,
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: defaultDescription,
    images: [defaultOgImage],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const qrCodeDataUrl = session?.user?.id ? await generateUserQrCode(session.user.id) : null;

  return (
    <html
      lang="it"
      className={`${bigShoulders.variable} ${workSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        <Header session={session} qrCodeDataUrl={qrCodeDataUrl} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
