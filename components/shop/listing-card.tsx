"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shop/category-badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/shop/cart-provider";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"] & {
  categories?: { slug: string } | null;
};

export function ListingCard({ listing }: { listing: Listing }) {
  const { addItem } = useCart();

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <Card className="overflow-hidden">
        <Link href={`/listings/${listing.slug}`}>
          <div className="relative aspect-[4/3] w-full bg-muted">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
            <CategoryBadge slug={listing.categories?.slug} className="absolute left-3 top-3" />
            {listing.stock_count <= 0 && (
              <Badge variant="secondary" className="absolute right-3 top-3">
                Out of stock
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="space-y-1 pt-4">
          <Link href={`/listings/${listing.slug}`} className="font-medium hover:underline">
            {listing.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="font-semibold">{formatPrice(listing.price_cents, listing.currency)}</span>
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
    </motion.div>
  );
}
