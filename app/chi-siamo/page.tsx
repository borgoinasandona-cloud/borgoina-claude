import type { Metadata } from "next";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["chi-siamo"],
};

export default async function ChiSiamoPage() {
  const page = await getPage("chi-siamo");

  return <StaticPageView title={staticPageTitles["chi-siamo"]} content={page?.content} />;
}
