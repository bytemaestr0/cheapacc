import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/shop/category-badge";
import { formatPrice } from "@/lib/utils";
import { OptionList } from "@/components/shop/option-chip";
import { AuthorCard } from "@/components/shop/author-badge";
import { resolveAuthor, type Author } from "@/lib/authors";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

// Public product page — cache per slug instead of hitting Supabase on
// every visit. Stock/price edits show up within a minute.
export const revalidate = 60;

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*, categories(name, image_url), authors(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!listing) notFound();

  const { data: defaultAuthor } = await supabase.from("authors").select("*").eq("is_default", true).maybeSingle();
  const author = resolveAuthor(listing.authors as Author | null, defaultAuthor);

  return (
    <div className="container grid grid-cols-1 gap-12 py-12 md:grid-cols-2">
      <>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
          {listing.image_url ? (
            <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          <CategoryBadge
            name={listing.categories?.name}
            imageUrl={listing.categories?.image_url}
            size="md"
            className="absolute left-3 top-3"
          />
        </div>
      </>

      <>
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {listing.stock_count > 0 ? (
                <Badge variant="success">In stock</Badge>
              ) : (
                <Badge variant="secondary">Out of stock</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
            <p className="mt-2 text-2xl font-semibold">
              {formatPrice(listing.price_cents, listing.currency)}
            </p>
          </div>

          <AuthorCard author={author} />

          <OptionList value={listing.options} />

          <p className="whitespace-pre-line text-muted-foreground">{listing.description}</p>

          {listing.delivery_notes && (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Delivery</p>
              <p className="mt-1 text-muted-foreground">{listing.delivery_notes}</p>
            </div>
          )}

          <AddToCartButton listing={listing} />
        </div>
      </>
    </div>
  );
}
