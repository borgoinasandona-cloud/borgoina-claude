import { Hero } from "@/components/home/Hero";
import { VerdePopolare } from "@/components/home/VerdePopolare";
import { BachecaHighlight } from "@/components/home/BachecaHighlight";
import { Iniziative } from "@/components/home/Iniziative";
import { BachecaPreview } from "@/components/home/BachecaPreview";
import { getFeaturedPost, getLatestPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredPost, latestPosts] = await Promise.all([
    getFeaturedPost(),
    getLatestPublishedPosts(4),
  ]);

  return (
    <div>
      <Hero />
      <VerdePopolare />
      <BachecaHighlight post={featuredPost ?? latestPosts[0] ?? null} />
      <Iniziative />
      <BachecaPreview posts={latestPosts} />
    </div>
  );
}
