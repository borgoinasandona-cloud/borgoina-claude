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
  revalidatePath("/");
}

export async function toggleFeaturedCommunityPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: { featured: true, slug: true },
  });
  if (!post) {
    throw new Error("Annuncio non trovato");
  }

  const newFeatured = !post.featured;

  if (newFeatured) {
    // Unset other featured community posts
    await prisma.communityPost.updateMany({
      where: { featured: true },
      data: { featured: false },
    });
  }

  await prisma.communityPost.update({
    where: { id },
    data: { featured: newFeatured },
  });

  revalidatePath("/admin/community");
  revalidatePath("/community");
  revalidatePath(`/community/${post.slug}`);
  revalidatePath("/");
}
