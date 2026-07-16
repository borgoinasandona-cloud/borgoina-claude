import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/CategoryForm";
import { deleteCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Categorie</h1>

      <div className="mt-6">
        <CategoryForm />
      </div>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-neutral-900">{category.name}</p>
              <p className="text-xs text-neutral-500">
                /{category.slug} · {category._count.posts} articoli
              </p>
            </div>
            <form action={deleteCategoryAction.bind(null, category.id)}>
              <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
                Elimina
              </button>
            </form>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="py-6 text-sm text-neutral-500">Nessuna categoria ancora.</li>
        )}
      </ul>
    </div>
  );
}
