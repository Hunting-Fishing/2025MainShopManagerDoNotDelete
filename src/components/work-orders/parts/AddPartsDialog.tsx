
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { InventoryPartsTab } from './InventoryPartsTab';
import { NonInventoryPartsTab } from './NonInventoryPartsTab';
import { saveMultipleWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartsAdd: () => void; // Changed to simple callback
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddPartsDialog({
  workOrderId,
  jobLineId,
  onPartsAdd,
  open,
  onOpenChange
}: AddPartsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedParts, setSelectedParts] = useState<WorkOrderPartFormValues[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleAddPart = (part: WorkOrderPartFormValues) => {
    setSelectedParts(prev => [...prev, part]);
  };

  const handleRemovePart = (index: number) => {
    setSelectedParts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedParts.length === 0) {
      toast.error('Please add at least one part');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMultipleWorkOrderParts(workOrderId, jobLineId, selectedParts);
      setSelectedParts([]);
      setIsOpen(false);
      onPartsAdd(); // Call the callback to refresh parts list
      toast.success(`${selectedParts.length} part${selectedParts.length !== 1 ? 's' : ''} added successfully`);
    } catch (error) {
      console.error('Error adding parts:', error);
      toast.error('Failed to add parts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-2 text-lg text-slate-950 bg-sky-500 hover:bg-sky-400 rounded">
          <Plus className="h-4 w-4" />
          Add Parts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-sky-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Parts to Work Order
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            <TabsTrigger value="non-inventory">Non-Inventory Parts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <InventoryPartsTab
              workOrderId={workOrderId}
              jobLineId={jobLineId}
              onAddPart={handleAddPart}
            />
          </TabsContent>
          
          <TabsContent value="non-inventory" className="space-y-4">
            <NonInventoryPartsTab
              workOrderId={workOrderId}
              jobLineId={jobLineId}
              onAddPart={handleAddPart}
            />
          </TabsContent>
        </Tabs>

        {selectedParts.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Selected Parts ({selectedParts.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedParts.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{part.partName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Qty: {part.quantity} × ${part.customerPrice} = ${(part.quantity * part.customerPrice).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePart(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedParts([])} disabled={isSubmitting}>
                Clear All
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Adding Parts...' 
                  : `Add ${selectedParts.length} Part${selectedParts.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
