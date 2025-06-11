
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrderJobLine } from '@/types/jobLine';

interface JobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobLine: WorkOrderJobLine;
  onUpdate: (jobLine: WorkOrderJobLine) => void;
}

export function JobLineDialog({ open, onOpenChange, jobLine, onUpdate }: JobLineDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Job line editing functionality will be implemented here.</p>
          <p>Job Line: {jobLine.name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
