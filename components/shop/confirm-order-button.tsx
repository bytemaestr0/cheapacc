"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Lets an admin manually mark a pending order as paid — useful when
 * confirming payment out-of-band (e.g. no payment provider wired up
 * yet, or a manual/offline payment) rather than waiting on a provider
 * webhook. Separate from fulfillment: this only flips pending -> paid;
 * delivering the actual credentials still goes through FulfillDialog.
 */
export function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to confirm order");
        return;
      }
      toast.success("Order confirmed as paid");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleConfirm} disabled={loading}>
      {loading ? "Confirming..." : "Confirm payment"}
    </Button>
  );
}
