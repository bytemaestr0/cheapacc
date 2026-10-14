"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteListingButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Listing deleted");
        router.refresh();
        return;
      }

      if (res.status === 409 && body.hasOrders) {
        if (confirm(`"${title}" has orders, so it can't be deleted.\n\nArchive it instead? It will be hidden from the store.`)) {
          const r = await fetch(`/api/listings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          });
          if (r.ok) {
            toast.success("Listing archived");
            router.refresh();
          } else {
            toast.error("Could not archive listing");
          }
        }
        return;
      }

      toast.error(typeof body.error === "string" ? body.error : "Could not delete listing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDelete}
      disabled={busy}
      aria-label={`Delete ${title}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline">{busy ? "Deleting…" : "Delete"}</span>
    </Button>
  );
}
