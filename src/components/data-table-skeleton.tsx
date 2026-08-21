"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 8,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4 animate-in fade-in-0 duration-500">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-muted/40 border-b px-4 py-3 flex gap-4">
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton
              key={`head-${i}`}
              className="h-4 flex-1"
              style={{ maxWidth: i === 0 ? 120 : 160 }}
            />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="border-b last:border-b-0 px-4 py-3 flex gap-4 items-center"
            style={{
              animationDelay: `${rowIdx * 50}ms`,
              opacity: 1 - rowIdx * 0.06,
            }}
          >
            {Array.from({ length: columnCount }).map((_, colIdx) => (
              <Skeleton
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-4 flex-1"
                style={{ maxWidth: colIdx === 0 ? 120 : 160 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
