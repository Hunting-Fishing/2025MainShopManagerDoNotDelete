
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceBasedJobLineForm } from './ServiceBasedJobLineForm';
import { ManualJobLineForm } from './ManualJobLineForm';

export interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobLineDialog({
  workOrderId,
  onJobLineAdd,
  open,
  onOpenChange
}: AddJobLineDialogProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'manual'>('service');

  const handleSubmit = (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => {
    onJobLineAdd(jobLines);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'service' | 'manual')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="service">Service Catalog</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="service" className="h-full mt-4">
              <ServiceBasedJobLineForm
                workOrderId={workOrderId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="h-full mt-4">
              <ManualJobLineForm
                workOrderId={workOrderId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
