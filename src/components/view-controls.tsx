"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setViewMode, toggleColumnVisibility } from "@/store/csvSlice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, LayoutGrid, Settings2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ViewControls() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.csv.columns);
  const hiddenColumns = useAppSelector((s) => s.csv.hiddenColumns);
  const viewMode = useAppSelector((s) => s.csv.viewMode);

  // Format column headers nicely
  const toLabel = (col: string) =>
    col
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle: List (Table) & Card */}
      <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => dispatch(setViewMode("table"))}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Table List View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => dispatch(setViewMode("card"))}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Card Grid View</TooltipContent>
        </Tooltip>
      </div>

      {/* Column Visibility Settings Dropdown using Checkbox & Popover */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Columns Visibility</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="w-60 p-0">
          <div className="p-3 border-b bg-muted/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Toggle Columns
            </h4>
          </div>
          <ScrollArea className="h-72">
            <div className="p-2 space-y-1">
              {columns.map((col) => {
                const isVisible = !hiddenColumns.includes(col);
                return (
                  <label
                    key={col}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-muted/60 cursor-pointer select-none transition-colors"
                  >
                    <Checkbox
                      checked={isVisible}
                      onCheckedChange={() => dispatch(toggleColumnVisibility(col))}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {toLabel(col)}
                    </span>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
