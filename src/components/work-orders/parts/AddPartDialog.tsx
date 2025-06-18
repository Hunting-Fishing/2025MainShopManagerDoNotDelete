
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { useToast } from '@/hooks/use-toast';
import { ComprehensivePartEntryForm } from './ComprehensivePartEntryForm';
import { TabbedPartEntryForm } from './TabbedPartEntryForm';
import { PartEntryModeToggle } from './PartEntryModeToggle';

interface AddPartDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdd?: (part: WorkOrderPart) => void;
  isOpen?: boolean;
  onClose?: () => void;
  jobLines?: any[];
  onPartAdded?: () => void;
}

export function AddPartDialog({
  workOrderId,
  jobLineId,
  onPartAdd,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onPartAdded
}: AddPartDialogProps) {
  const { toast } = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entryMode, setEntryMode] = useState<'comprehensive' | 'tabbed'>('comprehensive');

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (open: boolean) => {
    if (!open) externalOnClose();
  } : setInternalIsOpen;

  const handlePartAdd = async (partData: WorkOrderPartFormValues) => {
    setIsLoading(true);
    try {
      // Create a comprehensive part with all fields
      const newPart: WorkOrderPart = {
        id: `temp-${Date.now()}-${Math.random()}`,
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        part_number: partData.part_number,
        name: partData.name,
        description: partData.description,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_price: partData.quantity * partData.unit_price,
        status: partData.status || 'pending',
        notes: partData.notes,
        category: partData.category,
        supplierName: partData.supplierName,
        supplierCost: partData.supplierCost,
        customerPrice: partData.customerPrice,
        retailPrice: partData.retailPrice,
        markupPercentage: partData.markupPercentage,
        isTaxable: partData.isTaxable,
        coreChargeAmount: partData.coreChargeAmount,
        coreChargeApplied: partData.coreChargeApplied,
        warrantyDuration: partData.warrantyDuration,
        invoiceNumber: partData.invoiceNumber,
        poLine: partData.poLine,
        isStockItem: partData.isStockItem,
        notesInternal: partData.notesInternal,
        inventoryItemId: partData.inventoryItemId,
        partType: partData.partType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Call onPartAdd if provided
      if (onPartAdd) {
        onPartAdd(newPart);
      }

      // Call onPartAdded if provided
      if (onPartAdded) {
        onPartAdded();
      }

      toast({
        title: "Success",
        description: "Part added successfully"
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {externalIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Part</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>
        
        <PartEntryModeToggle mode={entryMode} onModeChange={setEntryMode} />
        
        {entryMode === 'comprehensive' ? (
          <ComprehensivePartEntryForm 
            onPartAdd={handlePartAdd} 
            onCancel={handleCancel} 
            isLoading={isLoading} 
          />
        ) : (
          <TabbedPartEntryForm 
            onPartAdd={handlePartAdd} 
            onCancel={handleCancel} 
            isLoading={isLoading} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
