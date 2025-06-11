
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkOrderPartFormValues, PART_TYPES, PART_STATUSES } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 0,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'inventory',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    status: 'ordered',
    isStockItem: false,
    notes: '',
    category: '',
    invoiceNumber: '',
    poLine: '',
    notesInternal: '',
    binLocation: '',
    warehouseLocation: '',
    shelfLocation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await saveWorkOrderPart(workOrderId, formData, jobLineId);
      
      if (success) {
        toast.success('Part added successfully');
        onPartsAdd();
        onOpenChange(false);
        // Reset form
        setFormData({
          partName: '',
          partNumber: '',
          supplierName: '',
          supplierCost: 0,
          markupPercentage: 0,
          retailPrice: 0,
          customerPrice: 0,
          quantity: 1,
          partType: 'inventory',
          isTaxable: true,
          coreChargeAmount: 0,
          coreChargeApplied: false,
          status: 'ordered',
          isStockItem: false,
          notes: '',
          category: '',
          invoiceNumber: '',
          poLine: '',
          notesInternal: '',
          binLocation: '',
          warehouseLocation: '',
          shelfLocation: ''
        });
      } else {
        toast.error('Failed to add part');
      }
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parts</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                min="0"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partType">Part Type</Label>
              <Select value={formData.partType} onValueChange={(value) => handleInputChange('partType', value)}>
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="isTaxable"
              checked={formData.isTaxable}
              onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
            />
            <Label htmlFor="isTaxable">Taxable</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
