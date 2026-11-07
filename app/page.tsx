import { Hero } from "@/components/home/Hero";
import { VerdePopolare } from "@/components/home/VerdePopolare";
import { BachecaHighlight } from "@/components/home/BachecaHighlight";
import { CommunityHighlight } from "@/components/home/CommunityHighlight";
import { BachecaPreview } from "@/components/home/BachecaPreview";
import { getFeaturedPosts, getLatestPublishedPosts } from "@/lib/posts";
import { getFeaturedCommunityPost } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredPosts, latestNonFeatured, featuredCommunityPost] = await Promise.all([
    getFeaturedPosts(),
    // 5 invece di 4: se nessun articolo è in evidenza, uno finisce nel blocco "Il Borgo utile"
    // come ripiego (vedi sotto) e ne restano comunque 4 per "Ultime dalla Bacheca".
    getLatestPublishedPosts(5, { excludeFeatured: true }),
    getFeaturedCommunityPost(),
  ]);

  const hasFeatured = featuredPosts.length > 0;
  const highlightPosts = hasFeatured ? featuredPosts : latestNonFeatured.slice(0, 1);
  const previewPosts = hasFeatured ? latestNonFeatured.slice(0, 4) : latestNonFeatured.slice(1, 5);

  return (
    <div>
      <Hero />
      <VerdePopolare />
      <BachecaHighlight posts={highlightPosts} />
      <BachecaPreview posts={previewPosts} />
      <CommunityHighlight post={featuredCommunityPost} />
    </div>
  );
}
