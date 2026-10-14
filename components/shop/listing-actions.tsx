"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Archive first. Once archived:
 *  - no orders  → red Delete (really deletes)
 *  - has orders → gray Delete that explains why on hover/tap
 */
export function ListingActions({
  id, title, status, orderCount,
}: { id: string; title: string; status: string; orderCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const archived = status === "archived";

  async function archive() {
    if (!confirm(`Archive "${title}"? It will be hidden from the store. You can delete it afterwards.`)) return;
    setBusy(true);
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    setBusy(false);
    if (!res.ok) return toast.error("Could not archive listing");
    toast.success("Listing archived");
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete "${title}" permanently? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(typeof body.error === "string" ? body.error : "Could not delete listing");
    toast.success("Listing deleted");
    router.refresh();
  }

  if (!archived) {
    return (
      <Button variant="ghost" size="sm" onClick={archive} disabled={busy} aria-label={`Archive ${title}`}>
        <Archive className="h-4 w-4" />
        <span className="hidden sm:inline">{busy ? "Archiving…" : "Archive"}</span>
      </Button>
    );
  }

  if (orderCount > 0) {
    const reason = `Can't delete: ${orderCount} order${orderCount === 1 ? "" : "s"} exist${orderCount === 1 ? "s" : ""} for this listing.`;
    return (
      <span className="group relative inline-block">
        <Button
          variant="ghost"
          size="sm"
          aria-disabled="true"
          aria-label={reason}
          onClick={() => toast.error(reason)}
          className="cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 w-max max-w-[220px] -translate-y-1/2 translate-x-1 rounded-lg border border-white/10 bg-popover px-3 py-2 text-left text-xs font-normal text-foreground opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          {reason}
        </span>
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={remove}
      disabled={busy}
      aria-label={`Delete ${title}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline">{busy ? "Deleting…" : "Delete"}</span>
    </Button>
  );
}
