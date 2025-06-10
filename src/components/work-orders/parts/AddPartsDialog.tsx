
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventorySelectionDialog } from '../inventory/InventorySelectionDialog';
import { ManualPartEntryDialog } from './ManualPartEntryDialog';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPart } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartsAdd: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddPartsDialog({ 
  workOrderId, 
  jobLineId, 
  onPartsAdd,
  trigger,
  open,
  onOpenChange
}: AddPartsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inventorySelectionOpen, setInventorySelectionOpen] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleAddInventoryItem = async (item: InventoryItemExtended) => {
    try {
      // Create a work order part from the inventory item
      const newPart: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'> = {
        workOrderId,
        jobLineId: jobLineId || '',
        inventoryItemId: item.id,
        partName: item.name,
        partNumber: item.sku || '',
        supplierCost: item.unit_price || 0,
        markupPercentage: 50, // Default markup
        retailPrice: (item.unit_price || 0) * 1.5,
        customerPrice: (item.unit_price || 0) * 1.5,
        quantity: 1,
        partType: 'inventory',
        isTaxable: true,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        status: 'ordered',
        isStockItem: true,
        dateAdded: new Date().toISOString(),
        attachments: []
      };

      // Here you would typically save to database
      console.log('Adding part:', newPart);
      
      toast.success('Part added successfully');
      setInventorySelectionOpen(false);
      setOpen(false);
      onPartsAdd();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  const handleAddManualPart = async (part: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Here you would typically save to database
      console.log('Adding manual part:', part);
      
      setManualEntryOpen(false);
      setOpen(false);
      onPartsAdd();
    } catch (error) {
      console.error('Error adding manual part:', error);
      toast.error('Failed to add part');
    }
  };

  const handleFromInventoryClick = () => {
    console.log('From Inventory button clicked');
    setInventorySelectionOpen(true);
  };

  const handleManualEntryClick = () => {
    console.log('Manual Entry button clicked');
    setManualEntryOpen(true);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add Parts
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {trigger && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        {!trigger && !open && (
          <DialogTrigger asChild>
            {defaultTrigger}
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Parts to {jobLineId ? 'Job Line' : 'Work Order'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you want to add parts:
            </p>
            
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={handleFromInventoryClick}
              >
                <div className="text-left">
                  <div className="font-medium">From Inventory</div>
                  <div className="text-sm text-muted-foreground">
                    Select parts from your inventory
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={handleManualEntryClick}
              >
                <div className="text-left">
                  <div className="font-medium">Manual Entry</div>
                  <div className="text-sm text-muted-foreground">
                    Add custom parts manually
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InventorySelectionDialog
        open={inventorySelectionOpen}
        onOpenChange={setInventorySelectionOpen}
        onAddItem={handleAddInventoryItem}
      />

      <ManualPartEntryDialog
        open={manualEntryOpen}
        onOpenChange={setManualEntryOpen}
        workOrderId={workOrderId}
        jobLineId={jobLineId}
        onPartAdd={handleAddManualPart}
      />
    </>
  );
}
