"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CATEGORIES, DEFAULT_CATEGORY_SLUG } from "@/lib/categories";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

/** id + slug pairs for rows currently in the `categories` table. */
export interface CategoryOption {
  id: string;
  slug: string;
}

export function ListingForm({
  listing,
  categoryOptions,
  initialCategorySlug,
}: {
  listing?: Listing;
  /** Rows from the `categories` table — used to resolve slug -> id on submit. */
  categoryOptions: CategoryOption[];
  /** Slug of listing's current category, if editing an existing listing. */
  initialCategorySlug?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(listing?.title ?? "");
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    listing ? (listing.price_cents / 100).toString() : ""
  );
  const [stockCount, setStockCount] = useState(listing?.stock_count?.toString() ?? "0");
  const [status, setStatus] = useState(listing?.status ?? "draft");
  const [imageUrl, setImageUrl] = useState(listing?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState(listing?.delivery_notes ?? "");
  const [categorySlug, setCategorySlug] = useState(
    initialCategorySlug ?? DEFAULT_CATEGORY_SLUG
  );
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/listings/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Upload failed");
        return;
      }

      const body = await res.json();
      setImageUrl(body.url);
      toast.success("Photo uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const matchedCategory = categoryOptions.find((c) => c.slug === categorySlug);
    if (!matchedCategory) {
      toast.error(
        "Category list isn't set up in the database yet — run prisma/seed.ts or insert rows into `categories` matching lib/categories.ts."
      );
      setLoading(false);
      return;
    }

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description,
      price_cents: Math.round(parseFloat(priceDollars || "0") * 100),
      stock_count: parseInt(stockCount || "0", 10),
      status,
      image_url: imageUrl || null,
      delivery_notes: deliveryNotes || null,
      category_id: matchedCategory.id,
    };

    const res = await fetch(
      listing ? `/api/listings/${listing.id}` : "/api/listings",
      {
        method: listing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Could not save listing");
      return;
    }

    toast.success(listing ? "Listing updated" : "Listing created");
    router.push("/admin/listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL path — leave blank to auto-generate)</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-listing" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={categorySlug} onValueChange={setCategorySlug}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={cat.slug} value={cat.slug}>
                  <span className="inline-flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${cat.colorClass}`} />
                    {cat.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Defaults to &quot;Other&quot; — pick the platform/game this listing belongs to so it
          shows up in the right section on the browse page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock count</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="imageUpload">Listing photo</Label>
        <div className="flex items-center gap-4">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-20 w-20 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              No photo
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              id="imageUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              {uploading ? "Uploading..." : "JPEG, PNG, WebP, or GIF — up to 5MB."}
            </p>
          </div>
        </div>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Or paste an image URL directly"
          className="mt-2"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryNotes">Delivery notes (shown to buyer)</Label>
        <textarea
          id="deliveryNotes"
          rows={2}
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="e.g. Delivered within 24h after manual review"
        />
      </div>

      <Button type="submit" disabled={loading || uploading}>
        {loading ? "Saving..." : listing ? "Save changes" : "Create listing"}
      </Button>
    </form>
  );
}
