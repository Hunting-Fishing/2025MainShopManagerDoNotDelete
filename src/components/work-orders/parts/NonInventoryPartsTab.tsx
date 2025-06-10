
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdded: () => void;
  onCancel: () => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onPartAdded,
  onCancel
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 30,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory' as const,
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    status: 'ordered' as const,
    isStockItem: false,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrices = (cost: number, markup: number) => {
    const retailPrice = cost * (1 + markup / 100);
    return {
      retailPrice,
      customerPrice: retailPrice
    };
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage;
        const prices = calculatePrices(cost, markup);
        updated.retailPrice = prices.retailPrice;
        updated.customerPrice = prices.customerPrice;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveWorkOrderPart(workOrderId, formData, jobLineId);
      toast.success('Part added successfully');
      onPartAdded();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
            onChange={(e) => handleInputChange('partName', e.target.value)}
            placeholder="Enter part name"
            required
          />
        </div>
        <div>
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber || ''}
            onChange={(e) => handleInputChange('partNumber', e.target.value)}
            placeholder="Enter part number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
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
          <Label htmlFor="supplierName">Supplier</Label>
          <Input
            id="supplierName"
            value={formData.supplierName || ''}
            onChange={(e) => handleInputChange('supplierName', e.target.value)}
            placeholder="Enter supplier name"
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
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="markupPercentage">Markup %</Label>
          <Input
            id="markupPercentage"
            type="number"
            step="1"
            min="0"
            value={formData.markupPercentage}
            onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
            placeholder="30"
          />
        </div>
        <div>
          <Label htmlFor="customerPrice">Customer Price</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.customerPrice.toFixed(2)}
            onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
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
        <div>
          <Label htmlFor="coreChargeAmount">Core Charge</Label>
          <Input
            id="coreChargeAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.coreChargeAmount}
            onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isTaxable"
            checked={formData.isTaxable}
            onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
          />
          <Label htmlFor="isTaxable">Taxable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="coreChargeApplied"
            checked={formData.coreChargeApplied}
            onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
          />
          <Label htmlFor="coreChargeApplied">Apply Core Charge</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
