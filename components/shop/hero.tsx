"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, Zap, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;
const WORDS = ["Digital", "goods,", "delivered", "securely."];

const PERKS = [
  { icon: ShieldCheck, text: "Secure checkout" },
  { icon: BadgeCheck, text: "Verified authors" },
  { icon: Zap, text: "Fast delivery" },
];

export function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const blobX = useTransform(sx, (v) => v * 40);
  const blobY = useTransform(sy, (v) => v * 30);

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <div className="bg-grid absolute inset-0 -z-10" />
      <motion.div style={{ x: blobX, y: blobY }} className="absolute -left-24 top-10 -z-10 h-72 w-72 animate-blob rounded-full bg-primary/30 blur-[90px] sm:h-96 sm:w-96" />
      <motion.div style={{ x: blobX, y: blobY }} className="absolute -right-20 top-40 -z-10 h-64 w-64 animate-blob rounded-full bg-[hsl(var(--aqua))]/20 blur-[90px] [animation-delay:-6s] sm:h-80 sm:w-80" />
      <div className="absolute bottom-0 right-1/3 -z-10 h-56 w-56 animate-blob rounded-full bg-[hsl(var(--rose))]/20 blur-[90px] [animation-delay:-11s]" />

      <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-24 lg:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[hsl(var(--success))]" />
            <span className="relative h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
          </span>
          New listings added daily
        </motion.span>

        <h1 className="mt-6 max-w-4xl text-[2.75rem] font-extrabold leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
          {WORDS.map((w, i) => (
            <span key={w} className="mr-[0.25em] inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                initial={{ y: "110%", rotate: 6 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease }}
                className={`inline-block ${i === 3 ? "text-gradient" : ""}`}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7, ease }}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          A digital marketplace where independent authors publish their listings. Find what you need, check out securely, and get your order delivered fast.
        </motion.p>

        <motion.form
          onSubmit={(e) => { e.preventDefault(); const t = q.trim(); router.push(t ? `/listings?q=${encodeURIComponent(t)}` : "/listings"); }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85, ease }}
          className="glass group mt-9 flex max-w-xl items-center gap-2 rounded-2xl p-2 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/.15)]"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search listings, authors, categories…"
            aria-label="Search listings"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" className="shrink-0">Search</Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
        >
          {PERKS.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{text}</span>
          ))}
          <Link href="/listings" className="group ml-auto inline-flex items-center gap-1.5 font-semibold text-foreground sm:ml-2">
            Browse everything <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
