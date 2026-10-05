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
import { OptionEditor } from "@/components/shop/option-editor";
import { parseOptions, type ListingOption } from "@/lib/listing-options";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

/** id + name pairs for rows currently in the `categories` table. */
export interface CategoryOption {
  id: string;
  name: string;
}

export function ListingForm({
  listing,
  categoryOptions,
  initialCategoryId,
  authorOptions = [],
}: {
  /** Rows from `authors`. Empty selection = default author (site owner). */
  authorOptions?: { id: string; name: string; is_default: boolean }[];
  listing?: Listing;
  /** Rows from the `categories` table, admin-managed via /admin/categories. */
  categoryOptions: CategoryOption[];
  /** Category id of listing's current category, if editing an existing listing. */
  initialCategoryId?: string | null;
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
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId ?? categoryOptions[0]?.id ?? ""
  );
  const [authorId, setAuthorId] = useState<string>(listing?.author_id ?? "default");
  const [options, setOptions] = useState<ListingOption[]>(parseOptions(listing?.options));
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

    if (!categoryId) {
      toast.error("Create a category first at /admin/categories, then pick one here.");
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
      category_id: categoryId,
      author_id: authorId === "default" ? null : authorId,
      options: options.filter((o) => o.label.trim()),
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
        {categoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories yet.{" "}
            <a href="/admin/categories" className="underline">
              Create one first
            </a>
            , then come back here.
          </p>
        ) : (
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          Pick the game/platform this listing belongs to so it shows up in the right section on
          the browse page. Manage the list at /admin/categories.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Author</Label>
        <Select value={authorId} onValueChange={setAuthorId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              Default{authorOptions.find((a) => a.is_default) ? ` (${authorOptions.find((a) => a.is_default)!.name})` : " (site owner)"}
            </SelectItem>
            {authorOptions.filter((a) => !a.is_default).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Who sold this. Manage authors at /admin/authors.
        </p>
      </div>

      <OptionEditor value={options} onChange={setOptions} />

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
