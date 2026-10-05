"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthorAvatar, AuthorTags } from "@/components/shop/author-badge";
import { resolveAuthor, type Author } from "@/lib/authors";

const empty = { name: "", avatar: "", tags: "", sales: "0", rating: "5", reviews: "0", anonymous: false, isDefault: false };

export function AuthorManager({ initialAuthors }: { initialAuthors: Author[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Author | null>(null);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);

  function start(a?: Author) {
    setEditing(a ?? null);
    setF(a ? {
      name: a.name, avatar: a.avatar_url ?? "", tags: a.tags.join(", "), sales: String(a.sales_count),
      rating: String(a.rating), reviews: String(a.review_count), anonymous: a.is_anonymous, isDefault: a.is_default,
    } : empty);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: f.name.trim(),
      avatar_url: f.avatar.trim() || null,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
      sales_count: Math.max(0, parseInt(f.sales || "0", 10)),
      rating: Math.min(5, Math.max(0, parseFloat(f.rating || "0"))),
      review_count: Math.max(0, parseInt(f.reviews || "0", 10)),
      is_anonymous: f.anonymous,
      is_default: f.isDefault,
    };
    const res = await fetch(editing ? `/api/authors/${editing.id}` : "/api/authors", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      toast.error(typeof b.error === "string" ? b.error : "Could not save author");
      return;
    }
    toast.success(editing ? "Author updated" : "Author created");
    setOpen(false);
    router.refresh();
  }

  async function remove(a: Author) {
    if (!confirm(`Delete "${a.name}"? Their listings will fall back to the default author.`)) return;
    const res = await fetch(`/api/authors/${a.id}`, { method: "DELETE" });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      toast.error(b.error ?? "Could not delete author");
      return;
    }
    toast.success("Author deleted");
    router.refresh();
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {initialAuthors.map((a) => {
          const d = resolveAuthor(a);
          return (
            <div key={a.id} className="glass flex items-start gap-3 rounded-2xl p-4">
              <AuthorAvatar author={d} className="h-12 w-12" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {a.name}
                  {a.is_default && <span className="rounded-full bg-success/20 px-2 py-0.5 text-[11px] text-success">Default</span>}
                  {a.is_anonymous && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">Anonymous</span>}
                </p>
                <AuthorTags tags={d.tags} />
                <p className="text-xs text-muted-foreground">
                  {d.rating.toFixed(1)}/5 out of {d.reviews.toLocaleString()} reviews · {d.sales.toLocaleString()} sales
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => start(a)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(a)} disabled={a.is_default}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      {!open && <Button onClick={() => start()}><Plus className="h-4 w-4" /> Add author</Button>}

      {open && (
        <form onSubmit={save} className="glass max-w-2xl space-y-4 rounded-2xl p-5">
          <h2 className="text-lg font-semibold">{editing ? `Edit ${editing.name}` : "New author"}</h2>
          <div className="space-y-1.5"><Label htmlFor="a-name">Name</Label><Input id="a-name" required value={f.name} onChange={set("name")} /></div>
          <div className="space-y-1.5"><Label htmlFor="a-avatar">Avatar URL (optional)</Label><Input id="a-avatar" value={f.avatar} onChange={set("avatar")} placeholder="https://…" /></div>
          <div className="space-y-1.5">
            <Label htmlFor="a-tags">Tags (comma separated, max 8)</Label>
            <Input id="a-tags" value={f.tags} onChange={set("tags")} placeholder="Verified, Top seller, Fast delivery" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label htmlFor="a-rating">Rating (0–5)</Label><Input id="a-rating" type="number" min="0" max="5" step="0.1" value={f.rating} onChange={set("rating")} /></div>
            <div className="space-y-1.5"><Label htmlFor="a-reviews">Reviews</Label><Input id="a-reviews" type="number" min="0" value={f.reviews} onChange={set("reviews")} /></div>
            <div className="space-y-1.5"><Label htmlFor="a-sales">Sales</Label><Input id="a-sales" type="number" min="0" value={f.sales} onChange={set("sales")} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.anonymous} onChange={(e) => setF((p) => ({ ...p, anonymous: e.target.checked }))} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            Anonymous (hide name and avatar, show a default user icon)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.isDefault} onChange={(e) => setF((p) => ({ ...p, isDefault: e.target.checked }))} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            Default author (used for listings with no author — the site owner)
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
