
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceBasedJobLineForm } from './ServiceBasedJobLineForm';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd, open, onOpenChange }: AddJobLineDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleJobLineAdd = (jobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    onJobLineAdd(jobLines);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Services to Work Order</DialogTitle>
        </DialogHeader>
        <ServiceBasedJobLineForm
          workOrderId={workOrderId}
          onSubmit={handleJobLineAdd}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
