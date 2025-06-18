
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySelector } from './CategorySelector';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  isLoading = false,
  workOrderId,
  jobLineId 
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    unit_price: 0,
    quantity: 1,
    description: '',
    status: 'pending',
    notes: '',
    // Optional fields
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    category: '',
    partType: '',
    markupPercentage: 0,
    isTaxable: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    notesInternal: '',
    inventoryItemId: '',
    job_line_id: jobLineId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.part_number || !formData.name) {
      alert('Part number and name are required');
      return;
    }

    // Calculate total price
    const totalPrice = formData.quantity * formData.unit_price;
    
    // Create the part data for submission
    const partData: WorkOrderPartFormValues = {
      ...formData,
      // Ensure numeric fields are properly typed
      quantity: Number(formData.quantity),
      unit_price: Number(formData.unit_price),
      supplierCost: Number(formData.supplierCost || 0),
      customerPrice: Number(formData.customerPrice || 0),
      retailPrice: Number(formData.retailPrice || 0),
      markupPercentage: Number(formData.markupPercentage || 0),
      coreChargeAmount: Number(formData.coreChargeAmount || 0),
    };

    onPartAdd(partData);
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprehensive Part Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part Number *</label>
              <Input
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Part Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Category Selection */}
          <CategorySelector
            value={formData.category || ''}
            onValueChange={(value) => handleInputChange('category', value)}
          />

          {/* Pricing Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Cost</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost || 0}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice || 0}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Retail Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice || 0}
                onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <Input
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Warranty Duration</label>
              <Input
                value={formData.warrantyDuration || ''}
                onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                placeholder="e.g., 12 months"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Internal Notes</label>
            <Textarea
              value={formData.notesInternal || ''}
              onChange={(e) => handleInputChange('notesInternal', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Part"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
