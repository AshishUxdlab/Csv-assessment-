"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, SlidersHorizontal, Filter } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setSearchTerm,
  setFilter,
  clearFilters,
  selectUniqueValues,
} from "@/store/csvSlice";

// Columns worth filtering on (categorical, low-cardinality)
const FILTER_COLUMNS = [
  "store_format",
  "city",
  "region",
  "brand",
  "variant",
  "shelf_level",
  "shelf_position",
  "in_stock",
  "on_promotion",
];

export function SearchFilterBar() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((s) => s.csv.searchTerm);
  const filters = useAppSelector((s) => s.csv.filters);
  const columns = useAppSelector((s) => s.csv.columns);

  // Only show filter selects for columns that exist in data
  const availableFilterColumns = useMemo(
    () => FILTER_COLUMNS.filter((c) => columns.includes(c)),
    [columns]
  );

  const activeFilterCount = Object.keys(filters).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="global-search"
            placeholder="Search across all columns…"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => dispatch(setSearchTerm(""))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Column filters Popover */}
        {availableFilterColumns.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-10 px-3 border-dashed">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > (searchTerm ? 1 : 0) && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] h-4">
                    {activeFilterCount - (searchTerm ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[300px] p-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm leading-none">Apply Filters</h4>
                  <p className="text-xs text-muted-foreground">
                    Filter table data by specific column values.
                  </p>
                </div>
                <div className="grid gap-3 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
                  {availableFilterColumns.map((col) => (
                    <ColumnFilterSelect key={col} column={col} />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearFilters())}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {Object.keys(filters).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([col, val]) => (
            <Badge
              key={col}
              variant="outline"
              className="gap-1 text-xs cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
              onClick={() => dispatch(setFilter({ column: col, value: "" }))}
            >
              {col}: {val}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Per-column filter select ───────────────────────────────────────
function ColumnFilterSelect({ column }: { column: string }) {
  const dispatch = useAppDispatch();
  const currentValue = useAppSelector((s) => s.csv.filters[column] ?? "");
  const uniqueValues = useAppSelector((s) => selectUniqueValues(s, column));

  // Nice label from snake_case
  const label = column
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  if (uniqueValues.length === 0 || uniqueValues.length > 50) return null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select
        value={currentValue || "all"}
        onValueChange={(v) =>
          dispatch(setFilter({ column, value: v === "all" ? "" : v }))
        }
      >
        <SelectTrigger className="w-full text-xs h-9">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {uniqueValues.map((v) => (
            <SelectItem key={v} value={v} className="text-xs">
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
