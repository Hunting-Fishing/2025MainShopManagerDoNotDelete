import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES } from '@/types/workOrderPart';
import { toast } from 'sonner';
import { insertWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string; // Made optional
  onPartsAdd: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPartsDialog({
  workOrderId,
  jobLineId,
  onPartsAdd,
  open,
  onOpenChange
}: AddPartsDialogProps) {
  const [parts, setParts] = useState<WorkOrderPartFormValues[]>([
    {
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 20,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'inventory',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered',
      isStockItem: true,
      notes: '',
      notesInternal: '',
      binLocation: '',
      warehouseLocation: '',
      shelfLocation: '',
      attachments: []
    }
  ]);

  const calculatePrices = (supplierCost: number, markupPercentage: number) => {
    const retailPrice = supplierCost * (1 + markupPercentage / 100);
    return {
      retailPrice: Number(retailPrice.toFixed(2)),
      customerPrice: Number(retailPrice.toFixed(2))
    };
  };

  const addNewPart = () => {
    setParts([...parts, {
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 20,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'inventory',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered',
      isStockItem: true,
      notes: '',
      notesInternal: '',
      binLocation: '',
      warehouseLocation: '',
      shelfLocation: '',
      attachments: []
    }]);
  };

  const removePart = (index: number) => {
    if (parts.length > 1) {
      setParts(parts.filter((_, i) => i !== index));
    }
  };

  const updatePart = (index: number, field: keyof WorkOrderPartFormValues, value: any) => {
    const updatedParts = [...parts];
    updatedParts[index] = { ...updatedParts[index], [field]: value };

    // Auto-calculate prices when supplier cost or markup changes
    if (field === 'supplierCost' || field === 'markupPercentage') {
      const { retailPrice, customerPrice } = calculatePrices(
        field === 'supplierCost' ? value : updatedParts[index].supplierCost,
        field === 'markupPercentage' ? value : updatedParts[index].markupPercentage
      );
      updatedParts[index].retailPrice = retailPrice;
      updatedParts[index].customerPrice = customerPrice;
    }

    setParts(updatedParts);
  };

  const handleSave = async () => {
    try {
      // Validate parts
      for (const part of parts) {
        if (!part.partName.trim()) {
          toast.error('Part name is required for all parts');
          return;
        }
        if (part.quantity <= 0) {
          toast.error('Quantity must be greater than 0');
          return;
        }
      }

      // Save all parts
      for (const part of parts) {
        await insertWorkOrderPart({
          workOrderId,
          jobLineId: jobLineId || null, // Use jobLineId if provided, otherwise null
          inventoryItemId: null,
          partName: part.partName,
          partNumber: part.partNumber || '',
          supplierName: part.supplierName || '',
          supplierCost: part.supplierCost,
          supplierSuggestedRetailPrice: part.supplierSuggestedRetailPrice,
          markupPercentage: part.markupPercentage,
          retailPrice: part.retailPrice,
          customerPrice: part.customerPrice,
          quantity: part.quantity,
          partType: part.partType,
          invoiceNumber: part.invoiceNumber || '',
          poLine: part.poLine || '',
          notes: part.notes || '',
          category: part.category,
          isTaxable: part.isTaxable,
          coreChargeAmount: part.coreChargeAmount,
          coreChargeApplied: part.coreChargeApplied,
          warrantyDuration: part.warrantyDuration,
          installDate: part.installDate,
          installedBy: part.installedBy,
          status: part.status,
          isStockItem: part.isStockItem,
          notesInternal: part.notesInternal,
          binLocation: part.binLocation,
          warehouseLocation: part.warehouseLocation,
          shelfLocation: part.shelfLocation
        });
      }

      toast.success(`${parts.length} part${parts.length > 1 ? 's' : ''} added successfully`);
      onPartsAdd();
      onOpenChange(false);
      
      // Reset form
      setParts([{
        partName: '',
        partNumber: '',
        supplierName: '',
        supplierCost: 0,
        supplierSuggestedRetailPrice: 0,
        markupPercentage: 20,
        retailPrice: 0,
        customerPrice: 0,
        quantity: 1,
        partType: 'inventory',
        category: '',
        isTaxable: true,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        status: 'ordered',
        isStockItem: true,
        notes: '',
        notesInternal: '',
        binLocation: '',
        warehouseLocation: '',
        shelfLocation: '',
        attachments: []
      }]);
    } catch (error) {
      console.error('Error adding parts:', error);
      toast.error('Failed to add parts');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add Parts {jobLineId ? 'to Job Line' : 'to Work Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {parts.map((part, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Part {index + 1}</h4>
                {parts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePart(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`partName-${index}`}>Part Name *</Label>
                  <Input
                    id={`partName-${index}`}
                    value={part.partName}
                    onChange={(e) => updatePart(index, 'partName', e.target.value)}
                    placeholder="Enter part name"
                  />
                </div>

                <div>
                  <Label htmlFor={`partNumber-${index}`}>Part Number</Label>
                  <Input
                    id={`partNumber-${index}`}
                    value={part.partNumber}
                    onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                    placeholder="Enter part number"
                  />
                </div>

                <div>
                  <Label htmlFor={`supplierName-${index}`}>Supplier</Label>
                  <Input
                    id={`supplierName-${index}`}
                    value={part.supplierName}
                    onChange={(e) => updatePart(index, 'supplierName', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <Label htmlFor={`category-${index}`}>Category</Label>
                  <Select
                    value={part.category}
                    onValueChange={(value) => updatePart(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`supplierCost-${index}`}>Supplier Cost</Label>
                  <Input
                    id={`supplierCost-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.supplierCost}
                    onChange={(e) => updatePart(index, 'supplierCost', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor={`markupPercentage-${index}`}>Markup %</Label>
                  <Input
                    id={`markupPercentage-${index}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={part.markupPercentage}
                    onChange={(e) => updatePart(index, 'markupPercentage', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor={`customerPrice-${index}`}>Customer Price</Label>
                  <Input
                    id={`customerPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.customerPrice}
                    onChange={(e) => updatePart(index, 'customerPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor={`status-${index}`}>Status</Label>
                  <Select
                    value={part.status}
                    onValueChange={(value) => updatePart(index, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor={`notes-${index}`}>Notes</Label>
                <Textarea
                  id={`notes-${index}`}
                  value={part.notes}
                  onChange={(e) => updatePart(index, 'notes', e.target.value)}
                  placeholder="Enter any notes about this part"
                  rows={2}
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addNewPart}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Part
          </Button>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Add {parts.length} Part{parts.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
