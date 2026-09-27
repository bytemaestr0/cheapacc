"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-ack";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. blocked) — just don't show the banner.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm md:flex-row">
        <div>
          <p className="font-medium">We use cookies</p>
          <p className="text-muted-foreground">
            Cookies keep you signed in and remember your cart. By using this site you agree to
            our use of them.
          </p>
        </div>
        <Button onClick={dismiss} className="shrink-0">
          Okay, understood.
        </Button>
      </div>
    </div>
  );
}
