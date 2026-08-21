"use client";

import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectFilteredRows,
  setSelectedRowId,
  ROW_ID_KEY,
  type CsvRow,
} from "@/store/csvSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Store,
  Tag,
  DollarSign,
  Info,
} from "lucide-react";

interface CardsListProps {
  onEdit: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

export function CardsList({ onEdit, onDelete }: CardsListProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.csv.columns);
  const hiddenColumns = useAppSelector((s) => s.csv.hiddenColumns);
  const filteredRows = useAppSelector(selectFilteredRows);
  const totalRows = useAppSelector((s) => s.csv.rows.length);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // Filter columns list by visibility
  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.includes(col)),
    [columns, hiddenColumns]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedRows = filteredRows.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const handleCardClick = (row: CsvRow) => {
    dispatch(setSelectedRowId(row[ROW_ID_KEY]));
  };

  // Helper to format snake_case label
  const toLabel = (col: string) =>
    col
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
          <Info className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="font-medium text-sm">No matching cards found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedRows.map((row) => {
            const rowId = row[ROW_ID_KEY];
            
            // Dynamic card details
            const title =
              row["product_name"] ||
              row["brand"] ||
              row["audit_id"] ||
              row[columns[0]] ||
              "Item Detail";

            const subtitle = row["brand"] && row["product_name"] ? row["brand"] : "";

            return (
              <Card
                key={rowId}
                className="group flex flex-col justify-between hover:shadow-md border-muted/70 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden relative"
                onClick={() => handleCardClick(row)}
              >
                {/* Glow outline on hover */}
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-lg pointer-events-none transition-colors" />

                <CardHeader className="pb-3 pt-4 px-4 bg-muted/10 border-b border-muted/40">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-heading font-semibold text-foreground truncate max-w-[190px]">
                        {title}
                      </CardTitle>
                      {subtitle && (
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {/* Status badge */}
                    {row["in_stock"] && (
                      <Badge
                        variant={
                          row["in_stock"].toLowerCase() === "true"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0 shrink-0"
                      >
                        {row["in_stock"].toLowerCase() === "true"
                          ? "In Stock"
                          : "Out of Stock"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="py-3 px-4 flex-1">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    {visibleColumns
                      .filter(
                        (col) =>
                          col !== "product_name" &&
                          col !== "brand" &&
                          col !== "in_stock"
                      )
                      .slice(0, 4)
                      .map((col) => {
                        const val = row[col] ?? "";
                        if (!val) return null;

                        let icon = null;
                        if (col.includes("date")) icon = <Calendar className="h-3 w-3 inline mr-1 text-muted-foreground/60" />;
                        else if (col.includes("store")) icon = <Store className="h-3 w-3 inline mr-1 text-muted-foreground/60" />;
                        else if (col.includes("price")) icon = <DollarSign className="h-3 w-3 inline mr-1 text-muted-foreground/60" />;
                        else if (col.includes("promotion")) icon = <Tag className="h-3 w-3 inline mr-1 text-muted-foreground/60" />;

                        return (
                          <div key={col} className="min-w-0">
                            <span className="text-[10px] text-muted-foreground block truncate uppercase tracking-wider">
                              {toLabel(col)}
                            </span>
                            <span className="font-medium text-foreground truncate block">
                              {icon}
                              {val}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>

                <CardFooter className="py-2.5 px-3 bg-muted/20 border-t border-muted/40 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ID: {row["audit_id"] ? row["audit_id"].substring(0, 10) : "Row"}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCardClick(row)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(rowId)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(rowId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredRows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="whitespace-nowrap font-medium text-muted-foreground select-none">
              Cards per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[72px] text-xs font-medium shrink-0 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 12, 24, 48].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap justify-center sm:justify-end">
            <span className="whitespace-nowrap font-medium tabular-nums text-foreground select-none">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={currentPage === 0}
                onClick={() => setPage(0)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={currentPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={currentPage >= totalPages - 1}
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
