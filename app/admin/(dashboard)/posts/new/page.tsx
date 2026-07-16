import { getAllCategories } from "@/lib/posts";
import { PostForm } from "@/components/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Nuovo articolo</h1>
      <PostForm categories={categories} />
    </div>
  );
}
