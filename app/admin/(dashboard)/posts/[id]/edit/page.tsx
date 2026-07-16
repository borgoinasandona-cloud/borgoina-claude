import { notFound } from "next/navigation";
import { getAllCategories, getPostByIdForAdmin } from "@/lib/posts";
import { PostForm } from "@/components/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPostByIdForAdmin(id), getAllCategories()]);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Modifica articolo</h1>
      <PostForm categories={categories} post={post} />
    </div>
  );
}
