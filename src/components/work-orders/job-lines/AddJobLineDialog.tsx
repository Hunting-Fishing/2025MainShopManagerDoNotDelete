
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineForm } from './AddJobLineForm';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd }: AddJobLineDialogProps) {
  const [open, setOpen] = useState(false);

  const handleJobLineAdd = (jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    onJobLineAdd(jobLineData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        <AddJobLineForm
          workOrderId={workOrderId}
          onSubmit={handleJobLineAdd}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
