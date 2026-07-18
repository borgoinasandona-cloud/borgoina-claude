"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export type PostFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
}

function parsePostFormData(formData: FormData) {
  const imagesRaw = formData.get("imagesJson");
  let images: unknown[] = [];
  if (typeof imagesRaw === "string" && imagesRaw.length > 0) {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = [];
    }
  }

  return postSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    coverImage: formData.get("coverImage") || "",
    externalLink: formData.get("externalLink") || "",
    publishedAt: formData.get("publishedAt") || "",
    featured: formData.get("featured") === "on",
    visibility: formData.get("visibility") || "PUBLIC",
    categoryIds: formData.getAll("categoryIds"),
    images,
  });
}

export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdmin();

  const parsed = parsePostFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { categoryIds, images, publishedAt, ...data } = parsed.data;

  let postId: string;
  try {
    const post = await prisma.post.create({
      data: {
        ...data,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categories: { connect: categoryIds.map((id) => ({ id })) },
        images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
      },
    });
    postId = post.id;
  } catch {
    return { status: "error", message: "Slug già esistente o errore di salvataggio." };
  }

  revalidatePath("/news");
  revalidatePath("/");
  redirect(`/admin/posts/${postId}/edit`);
}

export async function updatePostAction(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdmin();

  const parsed = parsePostFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const { categoryIds, images, publishedAt, ...data } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.postImage.deleteMany({ where: { postId: id } }),
      prisma.post.update({
        where: { id },
        data: {
          ...data,
          publishedAt: publishedAt ? new Date(publishedAt) : null,
          categories: { set: categoryIds.map((catId) => ({ id: catId })) },
          images: { create: images.map((img, index) => ({ ...img, order: img.order ?? index })) },
        },
      }),
    ]);
  } catch {
    return { status: "error", message: "Slug già esistente o errore di salvataggio." };
  }

  revalidatePath("/news");
  revalidatePath(`/news/${parsed.data.slug}`);
  revalidatePath("/");
  revalidatePath(`/admin/posts/${id}/edit`);

  return { status: "success", message: "Articolo salvato." };
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/posts");
}
