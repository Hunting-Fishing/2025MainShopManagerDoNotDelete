
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ComprehensivePartEntryForm({ onPartAdd, onCancel, isLoading }: ComprehensivePartEntryFormProps) {
  const [entryMode, setEntryMode] = useState<'manual' | 'inventory'>('manual');
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    category: '',
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    notesInternal: '',
    partType: 'inventory'
  });

  // Sample inventory parts for demonstration
  const inventoryParts = [
    {
      id: '1',
      part_number: 'BR-001',
      name: 'Brake Pads - Front',
      unit_price: 45.99,
      quantity_in_stock: 10,
      category: 'Brakes',
      description: 'Premium ceramic brake pads for front wheels'
    },
    {
      id: '2',
      part_number: 'OIL-001',
      name: 'Engine Oil Filter',
      unit_price: 12.99,
      quantity_in_stock: 25,
      category: 'Filters',
      description: 'High-performance oil filter'
    },
    {
      id: '3',
      part_number: 'SPK-001',
      name: 'Spark Plugs Set',
      unit_price: 28.99,
      quantity_in_stock: 15,
      category: 'Ignition',
      description: 'Premium iridium spark plugs - Set of 4'
    }
  ];

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'unit_price') {
        const quantity = field === 'quantity' ? value : updated.quantity;
        const unitPrice = field === 'unit_price' ? value : updated.unit_price;
        updated.customerPrice = quantity * unitPrice;
      }
      
      // Auto-calculate markup percentage when supplier cost and customer price change
      if (field === 'supplierCost' || field === 'customerPrice') {
        const supplierCost = field === 'supplierCost' ? value : updated.supplierCost || 0;
        const customerPrice = field === 'customerPrice' ? value : updated.customerPrice || 0;
        if (supplierCost > 0) {
          updated.markupPercentage = ((customerPrice - supplierCost) / supplierCost) * 100;
        }
      }
      
      return updated;
    });
  };

  const handleInventoryPartSelect = (inventoryPart: any) => {
    setFormData({
      part_number: inventoryPart.part_number,
      name: inventoryPart.name,
      description: inventoryPart.description,
      unit_price: inventoryPart.unit_price,
      quantity: 1,
      category: inventoryPart.category,
      status: 'pending',
      partType: 'inventory',
      isStockItem: true,
      customerPrice: inventoryPart.unit_price,
      isTaxable: true,
      coreChargeApplied: false,
      markupPercentage: 0,
      supplierCost: 0,
      retailPrice: inventoryPart.unit_price,
      notes: '',
      notesInternal: '',
      supplierName: '',
      invoiceNumber: '',
      poLine: '',
      warrantyDuration: '',
      coreChargeAmount: 0
    });
    setEntryMode('manual'); // Switch to manual mode for editing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number || !formData.name) {
      return;
    }
    
    onPartAdd(formData);
    
    // Reset form
    setFormData({
      part_number: '',
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      category: '',
      supplierName: '',
      supplierCost: 0,
      customerPrice: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      invoiceNumber: '',
      poLine: '',
      isStockItem: false,
      notesInternal: '',
      partType: 'inventory'
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={entryMode} onValueChange={(value) => setEntryMode(value as 'manual' | 'inventory')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Select from Inventory</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Inventory Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {inventoryParts.map((part) => (
                  <Card key={part.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleInventoryPartSelect(part)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{part.name}</h3>
                          <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                          <p className="text-sm text-muted-foreground">{part.description}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-sm">Price: ${part.unit_price}</span>
                            <span className="text-sm">Stock: {part.quantity_in_stock}</span>
                            <span className="text-sm">Category: {part.category}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={part.quantity_in_stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInventoryPartSelect(part);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <CategorySelector
                  value={formData.category || ''}
                  onValueChange={(value) => handleInputChange('category', value)}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
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
              </CardContent>
            </Card>

            {/* Quantity and Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPrice">Total Price</Label>
                  <Input
                    id="customerPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.customerPrice || (formData.quantity * formData.unit_price)}
                    onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplierCost">Supplier Cost</Label>
                  <Input
                    id="supplierCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.supplierCost || 0}
                    onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retailPrice">Retail Price</Label>
                  <Input
                    id="retailPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.retailPrice || 0}
                    onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="markupPercentage">Markup %</Label>
                  <Input
                    id="markupPercentage"
                    type="number"
                    step="0.01"
                    value={formData.markupPercentage || 0}
                    onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier and Core Charges Section */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier & Additional Charges</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SupplierSelector
                  value={formData.supplierName || ''}
                  onValueChange={(value) => handleInputChange('supplierName', value)}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="poLine">PO Line</Label>
                  <Input
                    id="poLine"
                    value={formData.poLine || ''}
                    onChange={(e) => handleInputChange('poLine', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                  <Input
                    id="coreChargeAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.coreChargeAmount || 0}
                    onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coreChargeApplied"
                    checked={formData.coreChargeApplied || false}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTaxable"
                    checked={formData.isTaxable || false}
                    onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                  />
                  <Label htmlFor="isTaxable">Taxable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isStockItem"
                    checked={formData.isStockItem || false}
                    onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                  />
                  <Label htmlFor="isStockItem">Stock Item</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                  <Input
                    id="warrantyDuration"
                    value={formData.warrantyDuration || ''}
                    onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                    placeholder="e.g., 12 months, 2 years"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Notes visible to customer..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notesInternal">Internal Notes</Label>
                  <Textarea
                    id="notesInternal"
                    value={formData.notesInternal || ''}
                    onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                    rows={3}
                    placeholder="Internal notes not visible to customer..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
