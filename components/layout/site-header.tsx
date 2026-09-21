"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          account<span className="text-muted-foreground">store</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/listings" className="transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="/support" className="transition-colors hover:text-foreground">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account/orders" aria-label="Account">
              <User />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
