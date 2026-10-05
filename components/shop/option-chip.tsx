import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseOptions, type ListingOption } from "@/lib/listing-options";

const styles = {
  positive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  negative: "border-rose-500/25 bg-rose-500/10 text-rose-400",
  info: "border-white/10 bg-white/[.06] text-muted-foreground",
} as const;

export function OptionChip({ option, className }: { option: ListingOption; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", styles[option.tone], className)}>
      {option.tone === "positive" && <ThumbsUp className="h-3.5 w-3.5 fill-current" />}
      {option.tone === "negative" && <ThumbsDown className="h-3.5 w-3.5 fill-current" />}
      {option.label}
    </span>
  );
}

/** `max` limits how many show (cards); the rest collapse into "+N". */
export function OptionList({ value, max, className }: { value: unknown; max?: number; className?: string }) {
  const all = parseOptions(value);
  if (all.length === 0) return null;
  const shown = max ? all.slice(0, max) : all;
  const extra = all.length - shown.length;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((o, i) => <OptionChip key={`${o.label}-${i}`} option={o} />)}
      {extra > 0 && <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1 text-xs text-muted-foreground">+{extra}</span>}
    </div>
  );
}
