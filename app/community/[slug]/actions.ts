"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema, communityPostStatusSchema } from "@/lib/validations";

export type CommentFormState = {
  status: "idle" | "error";
  message?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/community/login");
  }
  return session.user;
}

export async function addCommentAction(
  slug: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Commento non valido." };
  }

  const post = await prisma.communityPost.findUnique({ where: { slug }, select: { id: true } });
  if (!post) {
    return { status: "error", message: "Annuncio non trovato." };
  }

  await prisma.comment.create({
    data: { content: parsed.data.content, communityPostId: post.id, authorId: user.id },
  });

  revalidatePath(`/community/${slug}`);
  return { status: "idle" };
}

export async function updateOwnPostStatusAction(slug: string, formData: FormData) {
  const user = await requireUser();

  const parsed = communityPostStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await prisma.communityPost.updateMany({
    where: { slug, authorId: user.id },
    data: { status: parsed.data.status },
  });

  revalidatePath(`/community/${slug}`);
  revalidatePath("/community");
}

export async function deleteOwnPostAction(slug: string) {
  const user = await requireUser();

  await prisma.communityPost.deleteMany({ where: { slug, authorId: user.id } });

  revalidatePath("/community");
  redirect("/community");
}
