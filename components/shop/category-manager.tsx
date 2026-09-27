"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Pencil, GripVertical, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    router.refresh();
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"? Listings in it will become uncategorized.`)) return;

    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Could not delete category");
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    toast.success(`Deleted "${category.name}"`);
    refresh();
  }

  async function handleMove(category: Category, direction: "up" | "down") {
    const index = categories.findIndex((c) => c.id === category.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;

    const other = categories[swapIndex];
    const reordered = [...categories];
    reordered[index] = other;
    reordered[swapIndex] = category;
    setCategories(reordered);

    await Promise.all([
      fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: swapIndex }),
      }),
      fetch(`/api/categories/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: index }),
      }),
    ]);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3" />
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category, i) => (
              <tr key={category.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleMove(category, "up")}
                      disabled={i === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                      <Tag className="h-4 w-4" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(category);
                        setShowForm(true);
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No categories yet. Create your first one.
          </p>
        )}
      </div>

      {showForm ? (
        <CategoryForm
          category={editing}
          nextSortOrder={categories.length}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            setCategories((prev) => {
              const exists = prev.some((c) => c.id === saved.id);
              return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
            });
            setShowForm(false);
            setEditing(null);
            refresh();
          }}
        />
      ) : (
        <Button onClick={() => setShowForm(true)}>New category</Button>
      )}
    </div>
  );
}

function CategoryForm({
  category,
  nextSortOrder,
  onCancel,
  onSaved,
}: {
  category: Category | null;
  nextSortOrder: number;
  onCancel: () => void;
  onSaved: (category: Category) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/categories/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Upload failed");
        return;
      }
      const body = await res.json();
      setImageUrl(body.url);
      toast.success("Image uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      image_url: imageUrl || null,
      ...(category ? {} : { sort_order: nextSortOrder }),
    };

    const res = await fetch(category ? `/api/categories/${category.id}` : "/api/categories", {
      method: category ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Could not save category");
      return;
    }

    const body = await res.json();
    toast.success(category ? "Category updated" : "Category created");
    onSaved(body.category);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-border p-5">
      <h2 className="font-medium">{category ? "Edit category" : "New category"}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-slug">Slug (URL path — leave blank to auto-generate)</Label>
        <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="steam" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-image">Image</Label>
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              None
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              id="cat-image"
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
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving..." : category ? "Save changes" : "Create category"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
