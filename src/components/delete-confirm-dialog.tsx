"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAppDispatch } from "@/store/store";
import { deleteRowApi, setSelectedRowId } from "@/store/csvSlice";
import { toast } from "sonner";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  rowId,
}: DeleteConfirmDialogProps) {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (rowId) {
      try {
        await dispatch(deleteRowApi(rowId)).unwrap();
        dispatch(setSelectedRowId(null));
        toast.success("Row deleted from database");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete row");
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Row
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this row? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
