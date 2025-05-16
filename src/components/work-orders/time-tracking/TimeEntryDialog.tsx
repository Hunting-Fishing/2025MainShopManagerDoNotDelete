
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<TimeEntry>) => void;
  entry?: TimeEntry;
  workOrderId: string;
}

export const TimeEntryDialog: React.FC<TimeEntryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
  workOrderId,
}) => {
  // Prepare initial data for form if editing
  const initialData: Partial<TimeEntry> = entry ? {
    ...entry
  } : {
    work_order_id: workOrderId,
    billable: true
  };

  const handleFormSubmit = (formData: Partial<TimeEntry>) => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Time Entry" : "Add Time Entry"}</DialogTitle>
        </DialogHeader>

        <TimeEntryForm
          initialData={initialData}
          onSubmit={handleFormSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
