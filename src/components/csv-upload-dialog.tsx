"use client";

import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { parseCsvFile, type ParseResult } from "@/lib/csv-parser";
import { useAppDispatch } from "@/store/store";
import { setData, setLoading } from "@/store/csvSlice";

interface CsvUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvUploadDialog({ open, onOpenChange }: CsvUploadDialogProps) {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }
    setError("");
    setFileName(file.name);
    try {
      const result = await parseCsvFile(file);
      if (result.columns.length === 0) {
        setError("No columns found in the CSV file.");
        return;
      }
      setPreview(result);
    } catch {
      setError("Failed to parse CSV file. Please check the format.");
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleConfirm = () => {
    if (!preview) return;
    dispatch(setLoading(true));
    // Simulate a brief loading state for UX
    setTimeout(() => {
      dispatch(setData({ rows: preview.rows, columns: preview.columns }));
      handleReset();
      onOpenChange(false);
    }, 600);
  };

  const handleReset = () => {
    setPreview(null);
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewRows = preview ? preview.rows.slice(0, 5) : [];
  const previewColumns = preview ? preview.columns.slice(0, 8) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden p-0">
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-3 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Upload CSV File
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to load data into the table. Supported format: .csv
            </DialogDescription>
          </DialogHeader>
        </div>

        {!preview ? (
          <div className="space-y-4 px-6 pb-6">
            {/* Drag & drop zone */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-10
                flex flex-col items-center justify-center gap-4
                transition-all duration-200 cursor-pointer
                ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div
                className={`
                  flex h-16 w-16 items-center justify-center rounded-full
                  transition-colors duration-200
                  ${dragActive ? "bg-primary/10" : "bg-muted"}
                `}
              >
                <Upload
                  className={`h-7 w-7 transition-colors ${
                    dragActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                <X className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Scrollable middle content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-4 scrollbar-hide">
              {/* File info */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {preview.rows.length} rows · {preview.columns.length} columns
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Change file
                </Button>
              </div>

              {/* Columns badge list */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Detected Columns
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.columns.map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preview table */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Preview (first 5 rows)
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewColumns.map((col) => (
                            <TableHead
                              key={col}
                              className="text-xs whitespace-nowrap"
                            >
                              {col}
                            </TableHead>
                          ))}
                          {preview.columns.length > 8 && (
                            <TableHead className="text-xs text-muted-foreground">
                              +{preview.columns.length - 8} more
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.map((row, i) => (
                          <TableRow key={i}>
                            {previewColumns.map((col) => (
                              <TableCell
                                key={col}
                                className="text-xs whitespace-nowrap max-w-[150px] truncate"
                              >
                                {row[col] ?? ""}
                              </TableCell>
                            ))}
                            {preview.columns.length > 8 && (
                              <TableCell className="text-xs text-muted-foreground">
                                …
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed bottom action buttons — always visible */}
            <div className="shrink-0 border-t bg-background px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  handleReset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm} size="lg" className="gap-2 shadow-md">
                <Upload className="h-4 w-4" />
                Import {preview.rows.length} Rows
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
