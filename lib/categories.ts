import {
  Gamepad2,
  Crosshair,
  Target,
  Pickaxe,
  Tent,
  Boxes,
  type LucideIcon,
} from "lucide-react";

/**
 * Fixed category list for the storefront. Kept as app config (not
 * freely admin-editable) so the browse page can group listings into a
 * stable, predictable set of sections with consistent icons.
 *
 * To add a category: add an entry here, then add a matching row to the
 * `categories` table (see prisma/seed.ts) with the same slug.
 *
 * Icons are generic lucide-react glyphs rather than brand logos —
 * game/platform names and logos are trademarks of their respective
 * owners and aren't reproduced here.
 */
export interface CategoryConfig {
  slug: string;
  label: string;
  icon: LucideIcon;
  colorClass: string; // tailwind text-color utility for the icon
}

export const CATEGORIES: CategoryConfig[] = [
  { slug: "steam", label: "Steam", icon: Boxes, colorClass: "text-slate-500 dark:text-slate-300" },
  { slug: "valorant", label: "Valorant", icon: Crosshair, colorClass: "text-rose-500" },
  { slug: "csgo", label: "CS:GO", icon: Target, colorClass: "text-orange-500" },
  { slug: "minecraft", label: "Minecraft", icon: Pickaxe, colorClass: "text-emerald-600" },
  { slug: "fortnite", label: "Fortnite", icon: Tent, colorClass: "text-violet-500" },
  { slug: "other", label: "Other", icon: Gamepad2, colorClass: "text-muted-foreground" },
];

export const DEFAULT_CATEGORY_SLUG = "other";

export function getCategoryConfig(slug: string | null | undefined): CategoryConfig {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES.find((c) => c.slug === DEFAULT_CATEGORY_SLUG)!;
}
