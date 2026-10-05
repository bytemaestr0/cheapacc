import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayAuthor } from "@/lib/authors";

export function AuthorAvatar({ author, className }: { author: DisplayAuthor; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-[hsl(var(--aqua))]/20 text-primary ring-1 ring-white/10", className)}>
      {author.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="h-[55%] w-[55%]" />
      )}
    </span>
  );
}

export function AuthorTags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <span key={t} className="rounded-lg border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
          {t}
        </span>
      ))}
    </div>
  );
}

/** Compact: used on listing cards. */
export function AuthorLine({ author }: { author: DisplayAuthor }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <AuthorAvatar author={author} className="h-6 w-6" />
      <span className="truncate font-semibold text-foreground">{author.name}</span>
      <span className="inline-flex shrink-0 items-center gap-1">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        {author.rating.toFixed(1)}/5
      </span>
      <span className="hidden shrink-0 sm:inline">· {author.sales.toLocaleString()} sales</span>
    </div>
  );
}

/** Full: used on the listing page. */
export function AuthorCard({ author }: { author: DisplayAuthor }) {
  const filled = Math.round(author.rating);
  return (
    <div className="glass flex items-start gap-4 rounded-2xl p-4">
      <AuthorAvatar author={author} className="h-14 w-14" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Sold by</p>
          <p className="font-display text-lg font-bold leading-tight">{author.name}</p>
        </div>
        <AuthorTags tags={author.tags} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn("h-4 w-4", n <= filled ? "fill-amber-400 text-amber-400" : "text-white/20")} />
              ))}
            </span>
            <b className="text-foreground">{author.rating.toFixed(1)}/5</b> out of {author.reviews.toLocaleString()} reviews
          </span>
          <span>· <b className="text-foreground">{author.sales.toLocaleString()}</b> sales</span>
        </div>
      </div>
    </div>
  );
}
