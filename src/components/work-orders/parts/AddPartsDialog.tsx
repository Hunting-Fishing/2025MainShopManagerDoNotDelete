
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedPartEntryForm } from './UnifiedPartEntryForm';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface AddPartsDialogProps {
  workOrderId: string;
  onPartsAdd: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPartsDialog({
  workOrderId,
  onPartsAdd,
  open,
  onOpenChange
}: AddPartsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPart = async (partData: WorkOrderPartFormValues) => {
    try {
      setIsSubmitting(true);
      
      const success = await saveWorkOrderPart(workOrderId, partData);
      
      if (success) {
        toast.success('Part added successfully');
        onPartsAdd();
        onOpenChange(false);
      } else {
        toast.error('Failed to add part');
      }
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parts & Materials</DialogTitle>
          <DialogDescription>
            Add parts and materials to this work order. You can search inventory or add custom parts.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="inventory">From Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-6">
            <UnifiedPartEntryForm
              onSubmit={handleAddPart}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Inventory search functionality will be implemented here.</p>
              <p className="text-sm mt-2">For now, please use manual entry to add parts.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
