"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ShoppingCart, User, Receipt, ShoppingBag, Search, ShieldCheck, FileText, CircleHelp, Flag, Store, ChevronRight,
} from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/listings", label: "Browse", icon: Store },
  { href: "/terms", label: "Rules & Guarantee", icon: ShieldCheck },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/support", label: "Report a Bug", icon: Flag },
];
const MORE = [{ href: "/privacy", label: "Privacy", icon: FileText }];
const ACCOUNT = [
  { href: "/account", label: "Account", icon: User },
  { href: "/account/orders", label: "Orders", icon: Receipt },
];

export function SiteHeader() {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openedAtY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  const close = useCallback(() => setOpen(false), []);

  // Close on navigation
  useEffect(() => { close(); }, [pathname, close]);

  // Close when the page scrolls (small threshold so the keyboard opening doesn't trigger it)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (open && Math.abs(window.scrollY - openedAtY.current) > 10) close();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, close]);

  // Close on Escape / outside tap / touch-drag on the page behind
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onTouchMove = (e: TouchEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [open, close]);

  function toggle() {
    openedAtY.current = window.scrollY;
    setOpen((v) => !v);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    close();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  }

  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 pt-safe",
        scrolled || open ? "glass border-x-0 border-t-0 shadow-[0_10px_40px_-20px_#000]" : "border-b border-transparent"
      )}
    >
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-primary via-[hsl(var(--rose))] to-[hsl(var(--aqua))]"
      />
      <div className={cn("mx-auto flex max-w-[1280px] items-center gap-3 px-4 transition-all duration-500 sm:px-6", scrolled ? "h-14" : "h-[68px]")}>
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="lmarketz home">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--rose))] shadow-[0_8px_24px_-8px_hsl(var(--primary))] transition-transform duration-500 group-hover:rotate-[14deg] group-hover:scale-110">
            <ShoppingBag className="h-[18px] w-[18px] text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-gradient">l</span>marketz
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="relative ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                active(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active(item.href) && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[.07] ring-1 ring-white/10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="group relative ml-auto hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings…"
            aria-label="Search listings"
            className="h-10 w-full rounded-full border border-white/10 bg-white/[.04] pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:w-full focus:border-primary/60 focus:bg-white/[.07] focus:ring-4 focus:ring-primary/15"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {ACCOUNT.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-label={label} className="hidden h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:bg-white/[.07] hover:text-foreground active:scale-90 sm:grid">
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
          <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:bg-white/[.07] hover:text-foreground active:scale-90">
            <ShoppingCart className="h-[18px] w-[18px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, y: 6 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gradient-to-br from-primary to-[hsl(var(--rose))] px-1 text-[10px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Hamburger — mobile / tablet only, top right */}
          <button
            onClick={toggle}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="relative ml-1 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.04] transition-transform active:scale-90 lg:hidden"
          >
            <span className="relative block h-3.5 w-[18px]">
              <motion.span className="absolute left-0 h-[2px] w-full rounded-full bg-foreground" animate={open ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }} />
              <motion.span className="absolute left-0 top-[6px] h-[2px] w-full rounded-full bg-foreground" animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }} />
              <motion.span className="absolute left-0 h-[2px] w-full rounded-full bg-foreground" animate={open ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / tablet dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              ref={panelRef}
              initial={{ opacity: 0, y: -14, scale: 0.96, clipPath: "inset(0 0 100% 0 round 24px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(0 0 0% 0 round 24px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.97, clipPath: "inset(0 0 100% 0 round 24px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-3 top-full mt-2 w-[calc(100%-1.5rem)] max-w-sm origin-top-right overflow-hidden rounded-3xl border border-white/10 bg-popover/95 p-3 shadow-[0_30px_80px_-20px_#000] backdrop-blur-2xl lg:hidden"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/30 blur-3xl" />
              <form onSubmit={handleSearch} className="relative mb-2">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search listings…"
                  aria-label="Search listings"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[.05] pl-10 pr-4 text-base outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
                />
              </form>
              <motion.ul
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
                className="relative space-y-0.5"
              >
                {[...NAV, ...ACCOUNT, ...MORE].map(({ href, label, icon: Icon }) => (
                  <motion.li key={href} variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0 } }}>
                    <Link
                      href={href}
                      onClick={close}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors active:bg-white/10",
                        active(href) ? "bg-white/[.07] text-foreground" : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground"
                      )}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.06] text-primary transition-transform group-active:scale-90">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
