"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUploadClick: () => void;
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      {/* Animated icon container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
          <FileSpreadsheet className="h-12 w-12 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
        No Data Available
      </h3>
      <p className="text-muted-foreground text-sm max-w-md text-center mb-8 leading-relaxed">
        Upload a CSV file to get started. Your data will be displayed in an
        interactive table with search, filter, and full CRUD capabilities.
      </p>

      <Button
        onClick={onUploadClick}
        size="lg"
        className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
      >
        <Upload className="h-4 w-4" />
        Upload CSV File
      </Button>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary/20"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
