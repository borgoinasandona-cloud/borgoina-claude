import { Hero } from "@/components/home/Hero";
import { VerdePopolare } from "@/components/home/VerdePopolare";
import { BachecaHighlight } from "@/components/home/BachecaHighlight";
import { Iniziative } from "@/components/home/Iniziative";
import { BachecaPreview } from "@/components/home/BachecaPreview";
import { getLatestPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestPosts = await getLatestPublishedPosts(4);

  return (
    <div>
      <Hero />
      <VerdePopolare />
      <BachecaHighlight post={latestPosts[0] ?? null} />
      <Iniziative />
      <BachecaPreview posts={latestPosts} />
    </div>
  );
}
