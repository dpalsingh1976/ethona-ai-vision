import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-12" />
            <div className="flex gap-1">
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
