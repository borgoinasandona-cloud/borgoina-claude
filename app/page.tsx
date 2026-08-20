import { Hero } from "@/components/home/Hero";
import { VerdePopolare } from "@/components/home/VerdePopolare";
import { BachecaHighlight } from "@/components/home/BachecaHighlight";
import { CommunityHighlight } from "@/components/home/CommunityHighlight";
import { Iniziative } from "@/components/home/Iniziative";
import { BachecaPreview } from "@/components/home/BachecaPreview";
import { getFeaturedPost, getLatestPublishedPosts } from "@/lib/posts";
import { getFeaturedCommunityPost } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredPost, latestPosts, featuredCommunityPost] = await Promise.all([
    getFeaturedPost(),
    getLatestPublishedPosts(4),
    getFeaturedCommunityPost(),
  ]);

  return (
    <div>
      <Hero />
      <VerdePopolare />
      <BachecaHighlight post={featuredPost ?? latestPosts[0] ?? null} />
      <CommunityHighlight post={featuredCommunityPost} />
      <Iniziative />
      <BachecaPreview posts={latestPosts} />
    </div>
  );
}
