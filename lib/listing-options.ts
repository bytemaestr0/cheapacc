export type OptionTone = "positive" | "negative" | "info";
export interface ListingOption { label: string; tone: OptionTone }

export const TONES: { value: OptionTone; label: string }[] = [
  { value: "info", label: "Info (gray)" },
  { value: "positive", label: "Good (green)" },
  { value: "negative", label: "Bad (red)" },
];

/** Quick-add presets shown in the admin listing form. Tone can still be changed after adding. */
export const DEFAULT_OPTIONS: ListingOption[] = [
  { label: "Access to email (auto registered)", tone: "positive" },
  { label: "Access to email (native)", tone: "positive" },
  { label: "Last seen on Tuesday", tone: "positive" },
  { label: "Full access", tone: "positive" },
  { label: "Limited", tone: "negative" },
  { label: "No email access", tone: "negative" },
  { label: "Europe", tone: "info" },
  { label: "Standard", tone: "info" },
  { label: "Alpha (2×2)", tone: "info" },
  { label: "1 lvl", tone: "info" },
  { label: "SDA", tone: "info" },
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
