"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { communityPostSchema } from "@/lib/validations";
import { defaultCommentVisibilityFor } from "@/lib/community";
import { slugifyWithSuffix } from "@/lib/slugify";

export type NewCommunityPostState = {
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

export async function createCommunityPostAction(
  _prevState: NewCommunityPostState,
  formData: FormData,
): Promise<NewCommunityPostState> {
  const user = await requireUser();

  const parsed = communityPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage") || "",
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { type, ...data } = parsed.data;
  const slug = slugifyWithSuffix(data.title);

  const post = await prisma.communityPost.create({
    data: {
      ...data,
      slug,
      type,
      authorId: user.id,
      visibilityOfComments: defaultCommentVisibilityFor(type),
    },
  });

  revalidatePath("/community");
  redirect(`/community/${post.slug}`);
}
