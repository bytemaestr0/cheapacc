"use client";

import { useState } from "react";
import { Plus, ThumbsDown, ThumbsUp, Minus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionChip } from "@/components/shop/option-chip";
import { DEFAULT_OPTIONS, type ListingOption, type OptionTone } from "@/lib/listing-options";
import { cn } from "@/lib/utils";

const TONE_BTNS: { tone: OptionTone; icon: typeof Minus; label: string; on: string }[] = [
  { tone: "info", icon: Minus, label: "Informational (gray)", on: "bg-white/15 text-foreground" },
  { tone: "positive", icon: ThumbsUp, label: "Good feature (green)", on: "bg-emerald-500/25 text-emerald-400" },
  { tone: "negative", icon: ThumbsDown, label: "Negative feature (red)", on: "bg-rose-500/25 text-rose-400" },
];

export function OptionEditor({ value, onChange }: { value: ListingOption[]; onChange: (v: ListingOption[]) => void }) {
  const [custom, setCustom] = useState("");
  const has = (label: string) => value.some((o) => o.label.toLowerCase() === label.toLowerCase());

  function add(o: ListingOption) {
    if (!o.label.trim() || has(o.label) || value.length >= 20) return;
    onChange([...value, { label: o.label.trim(), tone: o.tone }]);
  }
  const update = (i: number, patch: Partial<ListingOption>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  return (
    <div className="space-y-3">
      <Label>Options</Label>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((o, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input value={o.label} onChange={(e) => update(i, { label: e.target.value })} className="h-10 flex-1" aria-label="Option text" />
              <div className="flex shrink-0 gap-1 rounded-xl bg-white/[.04] p-1">
                {TONE_BTNS.map(({ tone, icon: Icon, label, on }) => (
                  <button
                    key={tone} type="button" title={label} aria-label={label} aria-pressed={o.tone === tone}
                    onClick={() => update(i, { tone })}
                    className={cn("grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground", o.tone === tone && on)}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Remove option" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom option…" className="h-10"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add({ label: custom, tone: "info" }); setCustom(""); } }}
        />
        <button type="button" onClick={() => { add({ label: custom, tone: "info" }); setCustom(""); }} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-input px-3 text-sm font-semibold hover:bg-white/5">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs text-muted-foreground">Quick add (you can change the color after adding):</p>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_OPTIONS.filter((p) => !has(p.label)).map((p) => (
            <button key={p.label} type="button" onClick={() => add(p)} className="opacity-80 transition hover:opacity-100 active:scale-95">
              <OptionChip option={p} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
