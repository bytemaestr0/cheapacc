"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order placed" },
  { key: "paid", label: "Payment confirmed" },
  { key: "fulfilled", label: "Delivered" },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        This order was {status}. Contact support if you have questions.
      </p>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: done ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  scale: done ? 1 : 0.9,
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                {done ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                )}
              </motion.div>
              <span className={cn("text-xs", done ? "font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-border">
                <motion.div
                  initial={false}
                  animate={{ width: i < currentIndex ? "100%" : "0%" }}
                  className="h-px bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
