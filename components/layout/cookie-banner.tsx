"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-ack";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. blocked) — just don't show the banner.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 26 }}
          className="glass fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-4 rounded-2xl p-4 shadow-[0_20px_60px_-15px_#000] sm:bottom-5"
        >
          <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary sm:grid"><Cookie className="h-5 w-5" /></span>
          <p className="flex-1 text-sm leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">We use cookies.</span> They keep you signed in and remember your cart.
          </p>
          <Button onClick={dismiss} size="sm" className="shrink-0">Got it</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
