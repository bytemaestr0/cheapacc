"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shop/category-badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/shop/cart-provider";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"] & {
  categories?: { name: string; image_url: string | null } | null;
};

export function ListingCard({ listing }: { listing: Listing }) {
  const { addItem } = useCart();

  return (
    <Card className="glow-border group/card flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_hsl(var(--primary)/.55)]">
        <Link href={`/listings/${listing.slug}`}>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
            <CategoryBadge
              name={listing.categories?.name}
              imageUrl={listing.categories?.image_url}
              className="absolute left-3 top-3"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
            {listing.stock_count <= 0 && (
              <Badge variant="secondary" className="absolute right-3 top-3">
                Out of stock
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="flex-1 space-y-1.5 pt-4">
          <Link href={`/listings/${listing.slug}`} className="font-display text-lg font-semibold leading-snug transition-colors hover:text-primary">
            {listing.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3">
          <span className="font-display text-xl font-bold">{formatPrice(listing.price_cents, listing.currency)}</span>
          <Button
            size="sm"
            disabled={listing.stock_count <= 0}
            onClick={() => {
              addItem({
                listingId: listing.id,
                title: listing.title,
                slug: listing.slug,
                priceCents: listing.price_cents,
                imageUrl: listing.image_url,
              });
              toast.success(`Added "${listing.title}" to cart`);
            }}
          >
            Add to cart
          </Button>
        </CardFooter>
      </Card>
  );
}
