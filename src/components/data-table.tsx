"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectFilteredRows,
  setSelectedRowId,
  ROW_ID_KEY,
  type CsvRow,
} from "@/store/csvSlice";

interface DataTableProps {
  onEdit: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

type SortDir = "asc" | "desc" | null;

export function DataTable({ onEdit, onDelete }: DataTableProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.csv.columns);
  const filteredRows = useAppSelector(selectFilteredRows);
  const totalRows = useAppSelector((s) => s.csv.rows.length);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDir) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const va = (a[sortColumn] ?? "").toLowerCase();
      const vb = (b[sortColumn] ?? "").toLowerCase();
      // Try numeric sort
      const na = parseFloat(va);
      const nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) {
        return sortDir === "asc" ? na - nb : nb - na;
      }
      return sortDir === "asc"
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    });
  }, [filteredRows, sortColumn, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedRows = sortedRows.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const hiddenColumns = useAppSelector((s) => s.csv.hiddenColumns);

  // Dynamic visible columns filtered by user preference
  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.includes(col)),
    [columns, hiddenColumns]
  );

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortColumn(null);
        setSortDir(null);
      }
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
    setPage(0);
  };

  const handleRowClick = (row: CsvRow) => {
    dispatch(setSelectedRowId(row[ROW_ID_KEY]));
  };

  const getSortIcon = (col: string) => {
    if (sortColumn !== col) return <ArrowUpDown className="h-3 w-3" />;
    if (sortDir === "asc") return <ArrowUp className="h-3 w-3" />;
    return <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-2.5">
      {/* Table info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">
            {sortedRows.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{totalRows}</span>{" "}
          rows
          {columns.length > 0 && (
            <span>
              {" "}
              ·{" "}
              <span className="font-medium text-foreground">
                {visibleColumns.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {columns.length}
              </span>{" "}
              columns visible
            </span>
          )}
        </p>
      </div>

      {/* No results after filter */}
      {sortedRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ArrowUpDown className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-sm">No matching results</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="w-full h-[600px] overflow-auto relative scrollbar-hide">
              <div className="min-w-max">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10 text-center text-xs bg-muted/20">#</TableHead>
                      {visibleColumns.map((col) => (
                        <TableHead
                          key={col}
                          className="text-xs cursor-pointer select-none whitespace-nowrap hover:bg-muted/60 transition-colors"
                          onClick={() => handleSort(col)}
                        >
                          <div className="flex items-center gap-1.5">
                            {col
                              .split("_")
                              .map(
                                (w) =>
                                  w.charAt(0).toUpperCase() + w.slice(1)
                              )
                              .join(" ")}
                            {getSortIcon(col)}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-12 text-center text-xs">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row, idx) => {
                      const rowId = row[ROW_ID_KEY];
                      return (
                        <TableRow
                          key={rowId}
                          className="cursor-pointer group hover:bg-muted/30 transition-colors"
                          onClick={() => handleRowClick(row)}
                        >
                          <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                            {currentPage * pageSize + idx + 1}
                          </TableCell>
                          {visibleColumns.map((col) => {
                            const val = row[col] ?? "";
                            const isBool =
                              val.toLowerCase() === "true" ||
                              val.toLowerCase() === "false";

                            return (
                              <TableCell
                                key={col}
                                className="text-xs whitespace-nowrap max-w-[180px] truncate"
                              >
                                {isBool ? (
                                  <Badge
                                    variant={
                                      val.toLowerCase() === "true"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {val}
                                  </Badge>
                                ) : val === "" ? (
                                  <span className="text-muted-foreground/40">
                                    —
                                  </span>
                                ) : (
                                  val
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRowClick(row)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onEdit(rowId)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => onDelete(rowId)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="whitespace-nowrap font-medium text-muted-foreground select-none">
                Rows per page
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
                  {[10, 15, 25, 50, 100].map((n) => (
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
        </>
      )}
    </div>
  );
}
