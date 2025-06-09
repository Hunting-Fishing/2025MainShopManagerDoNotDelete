
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 30,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    notes: ''
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? parseFloat(value) || 0 : parseFloat(prev.supplierCost as string) || 0;
        const markup = field === 'markupPercentage' ? parseFloat(value) || 0 : parseFloat(prev.markupPercentage as string) || 0;
        
        const retailPrice = cost * (1 + markup / 100);
        updated.retailPrice = parseFloat(retailPrice.toFixed(2));
        updated.customerPrice = parseFloat(retailPrice.toFixed(2));
      }
      
      return updated;
    });
  };

  const handleSupplierChange = (supplierName: string) => {
    // Only update if it's not one of our placeholder values
    if (supplierName && supplierName !== '__no_suppliers__') {
      setFormData(prev => ({ ...prev, supplierName }));
    }
  };

  const handleAddPart = () => {
    // Validation
    if (!formData.partName?.trim()) {
      toast.error('Part name is required');
      return;
    }

    if (!formData.supplierCost || formData.supplierCost <= 0) {
      toast.error('Supplier cost must be greater than 0');
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    // Create the part object
    const newPart: WorkOrderPartFormValues = {
      partName: formData.partName!,
      partNumber: formData.partNumber || '',
      supplierName: formData.supplierName || '',
      supplierCost: formData.supplierCost!,
      markupPercentage: formData.markupPercentage!,
      retailPrice: formData.retailPrice!,
      customerPrice: formData.customerPrice!,
      quantity: formData.quantity!,
      partType: 'non-inventory',
      notes: formData.notes || ''
    };

    onAddPart(newPart);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 30,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      notes: ''
    });

    toast.success('Part added successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              value={formData.partName || ''}
              onChange={(e) => handleInputChange('partName', e.target.value)}
              placeholder="Enter part name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={formData.partNumber || ''}
              onChange={(e) => handleInputChange('partNumber', e.target.value)}
              placeholder="Enter part number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <SupplierSelector
              value={formData.supplierName || ''}
              onChange={handleSupplierChange}
              placeholder="Select supplier"
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
            <Label htmlFor="markup">Markup %</Label>
            <Input
              id="markup"
              type="number"
              step="1"
              min="0"
              value={formData.markupPercentage || ''}
              onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail Price</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice || ''}
              onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price</Label>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice || ''}
              onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter any notes about this part"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleAddPart} className="bg-blue-600 hover:bg-blue-700">
            Add Part
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
