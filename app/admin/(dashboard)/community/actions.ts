"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

export async function approveCommunityPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.communityPost.update({
    where: { id },
    data: { visibility: "PUBLIC" },
  });
  revalidatePath("/admin/community");
  revalidatePath("/community");
  revalidatePath(`/community/${post.slug}`);
}

export async function rejectCommunityPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.communityPost.update({
    where: { id },
    data: { visibility: "PRIVATE" },
  });
  revalidatePath("/admin/community");
  revalidatePath("/community");
  revalidatePath(`/community/${post.slug}`);
}

export async function deleteCommunityPostAction(id: string) {
  await requireAdmin();
  await prisma.communityPost.delete({ where: { id } });
  revalidatePath("/admin/community");
  revalidatePath("/community");
}
