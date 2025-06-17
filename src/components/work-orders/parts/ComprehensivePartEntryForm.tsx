
import React, { useState, useEffect } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ComprehensivePartEntryForm({ onPartAdd, onCancel, isLoading }: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    unit_price: 0,
    quantity: 1,
    description: '',
    status: 'pending',
    notes: '',
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

  // Calculate markup percentage when prices change
  useEffect(() => {
    if (formData.supplierCost && formData.customerPrice) {
      const markup = ((formData.customerPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({ ...prev, markupPercentage: Number(markup.toFixed(2)) }));
    }
  }, [formData.supplierCost, formData.customerPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPartAdd(formData);
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Comprehensive Part Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="supplier">Supplier</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Part Number *</label>
                  <Input
                    value={formData.part_number}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <CategorySelector
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    placeholder="Select or add category..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Part Type</label>
                  <Input
                    value={formData.partType || ''}
                    onChange={(e) => handleInputChange('partType', e.target.value)}
                    placeholder="e.g., OEM, Aftermarket, Used"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.customerPrice || 0}
                    onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Retail Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.retailPrice || 0}
                    onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Markup %</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.markupPercentage || 0}
                    onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="taxable"
                    checked={formData.isTaxable || false}
                    onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                  />
                  <label htmlFor="taxable" className="text-sm">Taxable Item</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Core Charge Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.coreChargeAmount || 0}
                    onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <SupplierSelector
                  value={formData.supplierName || ''}
                  onChange={(value) => handleInputChange('supplierName', value)}
                  placeholder="Select or add supplier..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Cost</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.supplierCost || 0}
                    onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PO Line</label>
                  <Input
                    value={formData.poLine || ''}
                    onChange={(e) => handleInputChange('poLine', e.target.value)}
                    placeholder="Purchase order line reference"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <Input
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  placeholder="Supplier invoice number"
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty Duration</label>
                  <Input
                    value={formData.warrantyDuration || ''}
                    onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                    placeholder="e.g., 12 months, 2 years"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stockItem"
                    checked={formData.isStockItem || false}
                    onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                  />
                  <label htmlFor="stockItem" className="text-sm">Stock Item</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Notes</label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  placeholder="Notes visible to customer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Internal Notes</label>
                <Textarea
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  rows={2}
                  placeholder="Internal notes (not visible to customer)"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
      </CardContent>
    </Card>
  );
}
