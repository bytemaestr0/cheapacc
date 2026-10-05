import { requireAdmin } from "@/lib/auth/require-admin";
import { AuthorManager } from "@/components/shop/author-manager";

export const metadata = { title: "Admin — Authors" };

export default async function AdminAuthorsPage() {
  const { supabase } = await requireAdmin();
  const { data: authors } = await supabase.from("authors").select("*").order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Authors</h1>
        <p className="text-sm text-muted-foreground">
          Sellers shown on listings. Everything here is set by hand — name, tags, rating, reviews and sales are display
          values only. Listings with no author use the default author. Anonymous authors show as &ldquo;Anonymous&rdquo; with a user icon.
        </p>
      </div>
      <AuthorManager initialAuthors={authors ?? []} />
    </div>
  );
}
