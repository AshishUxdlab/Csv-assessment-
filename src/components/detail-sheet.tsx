"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil,
  Trash2,
  X,
  FileText,
  Store,
  Box,
  Layers,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectSelectedRow, setSelectedRowId, ROW_ID_KEY } from "@/store/csvSlice";

interface DetailSheetProps {
  onEdit: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

// Logical categories for Shampoo CSV columns to present a professional CRM-like view
const DYNAMIC_CATEGORIES = [
  {
    title: "Audit Log & Auditor",
    icon: <ClipboardList className="h-4.5 w-4.5 text-primary" />,
    columns: ["audit_id", "date", "auditor_name"],
  },
  {
    title: "Store Details",
    icon: <Store className="h-4.5 w-4.5 text-primary" />,
    columns: ["store_id", "store_name", "store_format", "city", "region"],
  },
  {
    title: "Product Information",
    icon: <Box className="h-4.5 w-4.5 text-primary" />,
    columns: ["brand", "product_name", "sku_code", "variant", "size_ml", "competitor_brand"],
  },
  {
    title: "Shelf Placement & Placement Metrics",
    icon: <Layers className="h-4.5 w-4.5 text-primary" />,
    columns: [
      "shelf_facings",
      "total_shelf_facings",
      "share_of_shelf_pct",
      "shelf_level",
      "shelf_position",
      "display_type",
      "planogram_compliance",
    ],
  },
  {
    title: "Inventory & Pricing",
    icon: <DollarSign className="h-4.5 w-4.5 text-primary" />,
    columns: ["in_stock", "out_of_stock_duration", "shelf_price", "promo_price", "on_promotion"],
  },
];

export function DetailSheet({ onEdit, onDelete }: DetailSheetProps) {
  const dispatch = useAppDispatch();
  const selectedRow = useAppSelector(selectSelectedRow);
  const columns = useAppSelector((s) => s.csv.columns);
  const selectedRowId = useAppSelector((s) => s.csv.selectedRowId);

  const isOpen = !!selectedRow;

  // Nice formatter for column headers
  const toLabel = (col: string) =>
    col
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Group columns for professional grid details
  const categorizedSections = useMemo(() => {
    if (!selectedRow) return [];

    const mappedCols = new Set<string>();
    const sections = DYNAMIC_CATEGORIES.map((cat) => {
      // Find columns that actually exist in the current sheet data
      const availableCols = cat.columns.filter((c) => columns.includes(c));
      availableCols.forEach((c) => mappedCols.add(c));
      return {
        ...cat,
        columns: availableCols,
      };
    }).filter((s) => s.columns.length > 0);

    // Any leftover columns not mapped inside default categories
    const unmappedCols = columns.filter(
      (c) => c !== ROW_ID_KEY && !mappedCols.has(c) && c !== "notes"
    );

    if (unmappedCols.length > 0) {
      sections.push({
        title: "Additional Details",
        icon: <FileText className="h-4.5 w-4.5 text-primary" />,
        columns: unmappedCols,
      });
    }

    // Render "notes" as its own full width paragraph section at the end if it exists
    if (columns.includes("notes")) {
      sections.push({
        title: "Notes & Comments",
        icon: <FileText className="h-4.5 w-4.5 text-primary" />,
        columns: ["notes"],
      });
    }

    return sections;
  }, [selectedRow, columns]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(setSelectedRowId(null));
      }}
    >
      {/* 
        Responsive Width Configs:
        - Full page (w-full h-full) below md screen breakpoint (< 768px)
        - 50% width of the viewport (md:w-[50vw]) above md screen breakpoint
      */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-screen sm:!w-full md:!w-[50vw] !max-w-none p-0 flex flex-col h-[100dvh] bg-background border-none md:border-l shadow-2xl overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-xl font-bold">
              Details View
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => dispatch(setSelectedRowId(null))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription className="text-xs">
            {selectedRow
              ? `Displaying detailed schema audit data for row element.`
              : ""}
          </SheetDescription>
        </SheetHeader>

        {selectedRow && (
          <>
            <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                {categorizedSections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-xl border border-muted bg-muted/10 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 pb-1 border-b">
                      {section.icon}
                      <h3 className="font-heading text-sm font-semibold text-foreground">
                        {section.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {section.columns.map((col) => {
                        const val = selectedRow[col] ?? "";
                        const isNotes = col === "notes";
                        
                        // Custom formatters for beautiful CRM presentation
                        const isBool =
                          val.toLowerCase() === "true" ||
                          val.toLowerCase() === "false";

                        return (
                          <div
                            key={col}
                            className={`space-y-1 ${
                              isNotes ? "col-span-1 sm:col-span-2" : ""
                            }`}
                          >
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                              {toLabel(col)}
                            </span>
                            <div className="text-sm text-foreground break-words font-medium">
                              {isBool ? (
                                <Badge
                                  variant={
                                    val.toLowerCase() === "true"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-[11px] px-2 py-0"
                                >
                                  {val}
                                </Badge>
                              ) : val === "" ? (
                                <span className="text-muted-foreground/30 italic">—</span>
                              ) : isNotes ? (
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1 p-3 bg-muted/40 rounded-lg border">
                                  {val}
                                </p>
                              ) : (
                                val
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center gap-3 p-4 border-t bg-muted/10 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 h-10 font-semibold"
                onClick={() => {
                  if (selectedRowId) onEdit(selectedRowId);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit Record
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-2 h-10 font-semibold"
                onClick={() => {
                  if (selectedRowId) onDelete(selectedRowId);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Record
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
