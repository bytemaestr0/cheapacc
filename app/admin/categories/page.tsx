import { requireAdmin } from "@/lib/auth/require-admin";
import { CategoryManager } from "@/components/shop/category-manager";

export const metadata = { title: "Admin — Categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Categories group listings on the browse page and in the sidebar. Deleting a category
          doesn&apos;t delete its listings — they just become uncategorized.
        </p>
      </div>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  );
}
