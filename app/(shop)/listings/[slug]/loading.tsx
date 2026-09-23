import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container grid grid-cols-1 gap-12 py-12 md:grid-cols-2">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-6">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
