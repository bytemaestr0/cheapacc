"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/utils";

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
    <div className="container grid grid-cols-1 gap-12 py-12 lg:grid-cols-3">
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
              className="flex items-center gap-4 rounded-lg border border-border p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/listings/${item.slug}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">{formatPrice(item.priceCents)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="w-20 text-right font-medium">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.listingId)}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-fit rounded-lg border border-border p-6">
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
