import type { Metadata } from "next";
import { getPage, staticPageTitles } from "@/lib/pages";
import { StaticPageView } from "@/components/StaticPageView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: staticPageTitles["il-borgo"],
};

export default async function IlBorgoPage() {
  const page = await getPage("il-borgo");

  return <StaticPageView title={staticPageTitles["il-borgo"]} content={page?.content} />;
}
