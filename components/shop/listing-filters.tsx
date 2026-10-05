"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "", label: "Default" },
  { value: "cheap", label: "Cheap first" },
  { value: "expensive", label: "Expensive first" },
  { value: "newest", label: "Newest", icon: ChevronDown },
  { value: "oldest", label: "Oldest", icon: ChevronUp },
] as const;

const fieldBase =
  "h-11 rounded-xl border border-input bg-white/[.03] text-base outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:bg-white/[.06] focus:ring-4 focus:ring-primary/15 sm:text-sm";

export function ListingFilters({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");
  const sort = params.get("sort") ?? "";
  const first = useRef(true);

  function push(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v.trim()) sp.set(k, v.trim());
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Debounce typing in the price / search fields.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => push({ min, max, q }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, q]);

  return (
    <div className="glass space-y-3 rounded-2xl p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[150px_150px_1fr]">
        {[
          { id: "min", placeholder: "Price from", value: min, set: setMin },
          { id: "max", placeholder: "up to", value: max, set: setMax },
        ].map((f) => (
          <div key={f.id} className="relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.placeholder}
              aria-label={f.placeholder}
              className={cn(fieldBase, "w-full pl-3.5 pr-8")}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
          </div>
        ))}
        <div className="relative col-span-2 sm:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title"
            aria-label="Search by title"
            className={cn(fieldBase, "w-full pl-10 pr-4")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map(({ value, label, ...rest }) => {
          const Icon = "icon" in rest ? rest.icon : null;
          const active = sort === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => push({ sort: value })}
              aria-pressed={active}
              className={cn(
                "relative inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors active:scale-95",
                active ? "text-white" : "bg-white/[.05] text-muted-foreground hover:bg-white/[.09] hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--rose))] shadow-[0_8px_24px_-10px_hsl(var(--primary))]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{label}</span>
              {Icon && <Icon className="relative h-4 w-4" />}
            </button>
          );
        })}
        <span className="glass ml-auto inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm text-muted-foreground sm:w-auto">
          Shown <b className="mx-1 font-semibold text-foreground">{count.toLocaleString()}</b> {count === 1 ? "listing" : "listings"}
        </span>
      </div>
    </div>
  );
}
