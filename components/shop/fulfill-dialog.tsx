"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export function FulfillDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Login credentials");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFulfill() {
    if (!content.trim()) {
      toast.error("Enter the content to deliver");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to fulfill order");
        return;
      }
      toast.success("Order fulfilled — buyer can now see their delivery");
      setOpen(false);
      setContent("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Fulfill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fulfill order</DialogTitle>
          <DialogDescription>
            Enter what the buyer should receive. This is shown to them immediately and is only
            ever visible to them and admins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="username / password / redeem instructions / etc."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleFulfill} disabled={loading}>
            {loading ? "Fulfilling..." : "Mark fulfilled & notify buyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
