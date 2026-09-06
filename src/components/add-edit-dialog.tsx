"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  createRowApi,
  updateRowApi,
  setSelectedRowId,
  ROW_ID_KEY,
  type CsvRow,
} from "@/store/csvSlice";
import { toast } from "sonner";

interface AddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRowId: string | null;
}

export function AddEditDialog({
  open,
  onOpenChange,
  editRowId,
}: AddEditDialogProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.csv.columns);
  const rows = useAppSelector((s) => s.csv.rows);

  const isEdit = !!editRowId;
  const editRow = isEdit
    ? rows.find((r) => r[ROW_ID_KEY] === editRowId) ?? null
    : null;

  const [formData, setFormData] = useState<CsvRow>({});

  useEffect(() => {
    if (open) {
      if (editRow) {
        // Pre-fill with existing data (exclude internal id)
        const data: CsvRow = {};
        columns.forEach((col) => {
          data[col] = editRow[col] ?? "";
        });
        setFormData(data);
      } else {
        // Empty form
        const data: CsvRow = {};
        columns.forEach((col) => {
          data[col] = "";
        });
        setFormData(data);
      }
    }
  }, [open, editRow, columns]);

  const handleChange = (col: string, value: string) => {
    setFormData((prev) => ({ ...prev, [col]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editRowId) {
        await dispatch(updateRowApi({ rowId: editRowId, data: formData })).unwrap();
        dispatch(setSelectedRowId(null));
        toast.success("Row updated in database");
      } else {
        await dispatch(createRowApi(formData)).unwrap();
        toast.success("New row saved to database");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Database operation failed");
    }
  };

  // Nicer label from column names
  const toLabel = (col: string) =>
    col
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-screen !max-w-full sm:!max-w-[600px] !h-[100dvh] sm:!h-auto sm:max-h-[85vh] flex flex-col p-0 !m-0 !rounded-none sm:!rounded-xl !border-0 sm:!border">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              {isEdit ? (
                <>
                  <Save className="h-5 w-5 text-primary" />
                  Edit Row
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Add New Row
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the fields below and save your changes."
                : "Fill in the fields below to add a new row to the table."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-6">
              {columns.map((col) => (
                <div key={col} className="space-y-2">
                  <Label htmlFor={`field-${col}`} className="text-sm font-medium">
                    {toLabel(col)}
                  </Label>
                  <Input
                    id={`field-${col}`}
                    value={formData[col] ?? ""}
                    onChange={(e) => handleChange(col, e.target.value)}
                    placeholder={`Enter ${toLabel(col).toLowerCase()}`}
                    className="h-10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 pt-4 border-t mt-auto">
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                {isEdit ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Row
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
