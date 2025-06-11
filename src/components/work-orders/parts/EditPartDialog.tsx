
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrderPart } from '@/types/workOrderPart';

interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: WorkOrderPart;
  onSave: () => void;
}

export function EditPartDialog({ open, onOpenChange, part, onSave }: EditPartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Part editing functionality will be implemented here.</p>
          <p>Part: {part.partName}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
