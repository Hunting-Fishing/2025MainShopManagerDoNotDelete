
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

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
    // Optional fields with defaults
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
    inventoryItemId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPartAdd(formData);
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Part Number *</label>
              <Input
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
                placeholder="Enter part number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Part Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter part name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Part category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Part Type</label>
              <Input
                value={formData.partType || ''}
                onChange={(e) => handleInputChange('partType', e.target.value)}
                placeholder="Part type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantity & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantity & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity *</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unit Price *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice || 0}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supplier Cost</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost || 0}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Retail Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice || 0}
                onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Markup %</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.markupPercentage || 0}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Checkbox
                id="taxable"
                checked={formData.isTaxable || false}
                onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
              />
              <label htmlFor="taxable" className="text-sm font-medium">Taxable Item</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Supplier Name</label>
              <Input
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PO Line</label>
              <Input
                value={formData.poLine || ''}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Purchase order line"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <Input
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Invoice number"
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Checkbox
                id="stockItem"
                checked={formData.isStockItem || false}
                onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
              />
              <label htmlFor="stockItem" className="text-sm font-medium">Stock Item</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Warranty Duration</label>
              <Input
                value={formData.warrantyDuration || ''}
                onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                placeholder="e.g., 12 months, 2 years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Core Charge Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.coreChargeAmount || 0}
                onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="coreCharge"
              checked={formData.coreChargeApplied || false}
              onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
            />
            <label htmlFor="coreCharge" className="text-sm font-medium">Core Charge Applied</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Customer Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes visible to customer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Internal Notes</label>
            <Textarea
              value={formData.notesInternal || ''}
              onChange={(e) => handleInputChange('notesInternal', e.target.value)}
              placeholder="Internal notes (not visible to customer)"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
