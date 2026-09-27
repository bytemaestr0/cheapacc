"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, User, Receipt, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/shop/cart-provider";

export function SiteHeader() {
  const { count } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight">
          <ShoppingBag className="h-5 w-5 text-primary" />
          account<span className="text-muted-foreground">store</span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
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

        <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings..."
            className="h-9 pl-9"
            aria-label="Search listings"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account" aria-label="Account">
              <User />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account/orders" aria-label="Order history">
              <Receipt />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Search bar on its own row on small screens, where it's hidden above */}
      <form onSubmit={handleSearch} className="relative border-t border-border px-6 py-2 sm:hidden">
        <Search className="pointer-events-none absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings..."
          className="h-9 pl-9"
          aria-label="Search listings"
        />
      </form>
    </header>
  );
}
