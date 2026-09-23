import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/categories";

export function CategoryBadge({
  slug,
  className,
  size = "sm",
}: {
  slug: string | null | undefined;
  className?: string;
  size?: "sm" | "md";
}) {
  const category = getCategoryConfig(slug);
  const Icon = category.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 backdrop-blur",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4", category.colorClass)} />
      {category.label}
    </span>
  );
}
