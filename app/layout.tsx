import type { Metadata } from "next";
import { Big_Shoulders, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";
import { auth } from "@/lib/auth";

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

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: `Sito del comitato di quartiere ${siteConfig.name}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="it"
      className={`${bigShoulders.variable} ${workSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        <Header session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
