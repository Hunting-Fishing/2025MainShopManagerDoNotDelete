
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { UnifiedJobLineFormDialog } from './UnifiedJobLineFormDialog';

export interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLines: WorkOrderJobLine[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobLineDialog({
  workOrderId,
  onJobLineAdd,
  open,
  onOpenChange
}: AddJobLineDialogProps) {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleJobLineSave = (jobLines: WorkOrderJobLine[]) => {
    onJobLineAdd(jobLines);
    setShowServiceForm(false);
    setShowManualForm(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Job Line</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to add job lines to this work order:
            </p>
            
            <div className="grid gap-3">
              <Button
                onClick={() => setShowServiceForm(true)}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="text-left">
                  <div className="font-medium">From Service Catalog</div>
                  <div className="text-sm text-muted-foreground">
                    Select pre-configured services with pricing
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowManualForm(true)}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="text-left">
                  <div className="font-medium">Manual Entry</div>
                  <div className="text-sm text-muted-foreground">
                    Create a custom job line manually
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnifiedJobLineFormDialog
        workOrderId={workOrderId}
        mode="add-service"
        open={showServiceForm}
        onOpenChange={setShowServiceForm}
        onSave={handleJobLineSave}
      />

      <UnifiedJobLineFormDialog
        workOrderId={workOrderId}
        mode="add-manual"
        open={showManualForm}
        onOpenChange={setShowManualForm}
        onSave={handleJobLineSave}
      />
    </>
  );
}
