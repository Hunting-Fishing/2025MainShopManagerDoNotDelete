
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: WorkOrderPart | null;
  onPartUpdated: () => Promise<void>;
}

export function EditPartDialog({ 
  open, 
  onOpenChange, 
  part,
  onPartUpdated 
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    part_type: 'inventory'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        part_number: part.part_number || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        status: part.status || 'pending',
        notes: part.notes || '',
        part_type: part.part_type || 'inventory',
        job_line_id: part.job_line_id,
        customerPrice: part.unit_price || 0,
        supplierCost: part.supplierCost,
        retailPrice: part.retailPrice,
        markupPercentage: part.markupPercentage,
        isTaxable: part.isTaxable,
        coreChargeAmount: part.coreChargeAmount,
        coreChargeApplied: part.coreChargeApplied,
        warrantyDuration: part.warrantyDuration,
        warrantyExpiryDate: part.warrantyExpiryDate,
        installDate: part.installDate,
        installedBy: part.installedBy,
        invoiceNumber: part.invoiceNumber,
        poLine: part.poLine,
        isStockItem: part.isStockItem,
        supplierName: part.supplierName,
        supplierOrderRef: part.supplierOrderRef,
        notesInternal: part.notesInternal,
        inventoryItemId: part.inventoryItemId,
        estimatedArrivalDate: part.estimatedArrivalDate,
        itemStatus: part.itemStatus,
        category: part.category
      });
    }
  }, [part]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part) return;
    
    const validationErrors = PartsFormValidator.validatePartForm(formData);
    if (validationErrors.length > 0) {
      PartsFormValidator.showValidationErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateWorkOrderPart(part.id, formData);
      PartsFormValidator.showSuccessToast('Part updated successfully');
      await onPartUpdated();
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!part) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleChange('part_number', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="part_type">Part Type *</Label>
              <Select 
                value={formData.part_type} 
                onValueChange={(value) => handleChange('part_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PART_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_PART_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
