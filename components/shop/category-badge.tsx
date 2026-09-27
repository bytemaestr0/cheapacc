import Image from "next/image";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  name,
  imageUrl,
  className,
  size = "sm",
}: {
  name: string | null | undefined;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 backdrop-blur",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" width={16} height={16} className={cn(iconSize, "rounded-full object-cover")} />
      ) : (
        <Tag className={iconSize} />
      )}
      {name ?? "Uncategorized"}
    </span>
  );
}
