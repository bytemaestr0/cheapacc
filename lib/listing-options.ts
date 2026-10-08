export type OptionTone = "positive" | "negative" | "info";
export interface ListingOption { label: string; tone: OptionTone }

export const TONES: { value: OptionTone; label: string }[] = [
  { value: "info", label: "Info (gray)" },
  { value: "positive", label: "Good (green)" },
  { value: "negative", label: "Bad (red)" },
];

/** Quick-add presets shown in the admin listing form. Tone can still be changed after adding. */
export const DEFAULT_OPTIONS: ListingOption[] = [
  { label: "Instant delivery", tone: "positive" },
  { label: "Lifetime access", tone: "positive" },
  { label: "Updates included", tone: "positive" },
  { label: "Support included", tone: "positive" },
  { label: "Limited stock", tone: "negative" },
  { label: "No refunds", tone: "negative" },
  { label: "Digital download", tone: "info" },
  { label: "Standard", tone: "info" },
  { label: "Worldwide", tone: "info" },
  { label: "English", tone: "info" },
];

export function parseOptions(value: unknown): ListingOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((o) => {
    if (!o || typeof o !== "object") return [];
    const { label, tone } = o as Record<string, unknown>;
    if (typeof label !== "string" || !label.trim()) return [];
    return [{ label, tone: tone === "positive" || tone === "negative" ? tone : "info" } as ListingOption];
  });
}
