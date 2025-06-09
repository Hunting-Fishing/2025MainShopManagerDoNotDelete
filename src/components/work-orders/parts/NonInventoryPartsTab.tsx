
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';
import { toast } from 'sonner';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 20,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrices = (cost: number, markup: number) => {
    const retailPrice = cost * (1 + markup / 100);
    const customerPrice = retailPrice; // For non-inventory, customer price equals retail price
    return { retailPrice, customerPrice };
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate prices when cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? Number(value) : updated.supplierCost;
        const markup = field === 'markupPercentage' ? Number(value) : updated.markupPercentage;
        const { retailPrice, customerPrice } = calculatePrices(cost, markup);
        updated.retailPrice = retailPrice;
        updated.customerPrice = customerPrice;
      }
      
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formData.partName.trim()) {
      toast.error('Please enter a part name');
      return;
    }

    if (formData.supplierCost <= 0) {
      toast.error('Please enter a valid supplier cost');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to database
      await saveWorkOrderPart(workOrderId, jobLineId, formData);
      
      // Call the parent callback
      onAddPart(formData);
      
      // Reset form
      setFormData({
        partName: '',
        partNumber: '',
        supplierName: '',
        supplierCost: 0,
        markupPercentage: 20,
        retailPrice: 0,
        customerPrice: 0,
        quantity: 1,
        partType: 'non-inventory',
        invoiceNumber: '',
        poLine: '',
        notes: ''
      });

      toast.success('Part added successfully');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5" />
        <h3 className="text-lg font-medium">Add Non-Inventory Part</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
            onChange={(e) => handleInputChange('partName', e.target.value)}
            placeholder="Enter part name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => handleInputChange('partNumber', e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName}
            onChange={(value) => handleInputChange('supplierName', value)}
            placeholder="Select or add supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost *</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.supplierCost || ''}
            onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="markupPercentage">Markup %</Label>
          <Input
            id="markupPercentage"
            type="number"
            step="0.1"
            min="0"
            value={formData.markupPercentage}
            onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail Price</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            value={formData.retailPrice.toFixed(2)}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPrice">Customer Price</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            value={formData.customerPrice.toFixed(2)}
            onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            value={formData.poLine || ''}
            onChange={(e) => handleInputChange('poLine', e.target.value)}
            placeholder="Enter PO line"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.partName.trim() || formData.supplierCost <= 0}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </div>
  );
}
