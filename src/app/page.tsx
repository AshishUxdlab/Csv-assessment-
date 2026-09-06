"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Plus,
  Download,
  FileSpreadsheet,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/store";
import {
  clearData,
  clearDataApi,
  fetchCsvData,
  selectFilteredRows,
  loadFromStorage,
  setViewMode,
} from "@/store/csvSlice";
import { exportToCsv } from "@/lib/csv-parser";
import { useTheme } from "next-themes";

import { EmptyState } from "@/components/empty-state";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { DataTable } from "@/components/data-table";
import { CardsList } from "@/components/cards-list";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { CsvUploadDialog } from "@/components/csv-upload-dialog";
import { AddEditDialog } from "@/components/add-edit-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DetailSheet } from "@/components/detail-sheet";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.csv.columns);
  const totalRows = useAppSelector((s) => s.csv.rows.length);
  const filteredRows = useAppSelector(selectFilteredRows);
  const isLoading = useAppSelector((s) => s.csv.isLoading);
  const viewMode = useAppSelector((s) => s.csv.viewMode);
  const hasData = columns.length > 0;

  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);

  // Theme
  const { theme, setTheme } = useTheme();
  
  // Hydration state
  const [isMounted, setIsMounted] = useState(false);

  // Load state from MySQL backend on mount
  useEffect(() => {
    setIsMounted(true);
    dispatch(loadFromStorage());
    dispatch(fetchCsvData());

    // Auto-detect view mode on mount if not previously stored
    const stored = localStorage.getItem("csv_demo_state");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.viewMode) return;
      } catch {}
    }
    const isMobile = window.innerWidth < 768;
    dispatch(setViewMode(isMobile ? "card" : "table"));
  }, [dispatch]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleEdit = (rowId: string) => {
    setEditRowId(rowId);
    setAddEditOpen(true);
  };

  const handleDelete = (rowId: string) => {
    setDeleteRowId(rowId);
    setDeleteOpen(true);
  };

  const handleAddNew = () => {
    setEditRowId(null);
    setAddEditOpen(true);
  };

  const handleExport = () => {
    const csv = exportToCsv(
      filteredRows.map((r) => {
        const clean = { ...r };
        delete clean["__row_id__"];
        return clean;
      }),
      columns
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg w-full">
        <div className="w-full mx-auto flex items-center justify-between px-3 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold tracking-tight">
                CSV Demo
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Upload, view & manage CSV data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pl-2 pr-1 -mr-3 sm:mr-0">
            {hasData && (
              <>
                <Badge variant="secondary" className="text-xs tabular-nums shrink-0 hidden sm:inline-flex">
                  {totalRows} rows
                </Badge>

                <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={handleAddNew}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Row</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new row to the table</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export filtered data as CSV</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => dispatch(clearDataApi())}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear all data</TooltipContent>
                </Tooltip>
              </>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => setUploadOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload CSV</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload a new CSV file</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleTheme}
            >
              {isMounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <main className="flex-1 w-full px-3 md:px-8 py-3 sm:py-6 space-y-3 sm:space-y-4">
        {!isMounted || isLoading ? (
          <DataTableSkeleton columnCount={8} rowCount={12} />
        ) : hasData ? (
          <div className="space-y-3 sm:space-y-4">
            <SearchFilterBar />

            {viewMode === "table" ? (
              <DataTable onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <CardsList onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        ) : (
          <EmptyState onUploadClick={() => setUploadOpen(true)} />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/30 w-full">
        <div className="w-full px-3 md:px-8 py-4 flex items-center justify-between text-xs text-muted-foreground flex-col sm:flex-row gap-2 text-center sm:text-left">
          <p>CSV Demo — Shampoo Share of Shelf Data Manager</p>
          <p>Built with Next.js, shadcn/ui & Redux Toolkit</p>
        </div>
      </footer>

      {/* ── Dialogs & Sheet ─────────────────────────────────────── */}
      <CsvUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <AddEditDialog
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        editRowId={editRowId}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        rowId={deleteRowId}
      />

      <DetailSheet onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
