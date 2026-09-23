"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RoleToggleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const nextRole = currentRole === "admin" ? "customer" : "admin";

  async function handleToggle() {
    const confirmed = window.confirm(
      nextRole === "admin"
        ? "Grant this user admin access? They'll be able to manage listings, orders, and other users."
        : "Remove admin access from this user?"
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to update role");
        return;
      }
      toast.success(`User is now ${nextRole === "admin" ? "an admin" : "a customer"}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading}>
      {loading ? "Updating..." : nextRole === "admin" ? "Make admin" : "Remove admin"}
    </Button>
  );
}
