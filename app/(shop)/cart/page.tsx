"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/utils";

function Qty({ value, onChange }: { value: number; onChange: (q: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Remove" className="h-9 w-9 shrink-0">
      <Trash2 className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something from the listings page to get started.</p>
        <Button asChild className="mt-6">
          <Link href="/listings">Browse listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-3 lg:gap-12">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.listingId}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass overflow-hidden rounded-2xl"
            >
              <div className="flex gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-16 sm:w-16">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/listings/${item.slug}`} className="line-clamp-2 break-words font-medium hover:underline">
                      {item.title}
                    </Link>
                    <span className="-mr-1 -mt-1 sm:hidden">
                      <RemoveButton onClick={() => removeItem(item.listingId)} />
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.priceCents)} each</p>

                  {/* Mobile: quantity + line total on their own row */}
                  <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                    <Qty value={item.quantity} onChange={(q) => updateQuantity(item.listingId, q)} />
                    <span className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</span>
                  </div>
                </div>

                {/* Desktop: everything on one row */}
                <div className="hidden items-center gap-4 sm:flex">
                  <Qty value={item.quantity} onChange={(q) => updateQuantity(item.listingId, q)} />
                  <span className="w-24 text-right font-semibold">{formatPrice(item.priceCents * item.quantity)}</span>
                  <RemoveButton onClick={() => removeItem(item.listingId)} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass h-fit rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotalCents)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Payment is processed at checkout. No fees added here.
        </p>
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
      </div>
    </div>
  );
}
