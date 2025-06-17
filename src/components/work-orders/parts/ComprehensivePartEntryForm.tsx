
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    // Supplier & Pricing
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    markupPercentage: 0,
    // Categories & Types
    category: '',
    partType: '',
    // Billing & Tax
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    // Warranty & Installation
    warrantyDuration: '',
    // Order & Inventory
    invoiceNumber: '',
    poLine: '',
    isStockItem: true,
    notesInternal: '',
    inventoryItemId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate fields based on input
    const calculatedData = {
      ...formData,
      // Auto-calculate customer price if not set
      customerPrice: formData.customerPrice || (formData.supplierCost * (1 + (formData.markupPercentage / 100))),
      // Auto-calculate retail price if not set
      retailPrice: formData.retailPrice || formData.customerPrice || (formData.supplierCost * (1 + (formData.markupPercentage / 100))),
    };
    
    onPartAdd(calculatedData);
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate markup percentage when costs change
      if (field === 'supplierCost' || field === 'customerPrice') {
        if (updated.supplierCost > 0 && updated.customerPrice > 0) {
          updated.markupPercentage = ((updated.customerPrice - updated.supplierCost) / updated.supplierCost) * 100;
        }
      }
      
      // Auto-calculate customer price when markup changes
      if (field === 'markupPercentage' && updated.supplierCost > 0) {
        updated.customerPrice = updated.supplierCost * (1 + (updated.markupPercentage / 100));
      }
      
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Cost</TabsTrigger>
          <TabsTrigger value="details">Details & Warranty</TabsTrigger>
          <TabsTrigger value="inventory">Inventory & Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Part Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="part_number">Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => handleInputChange('part_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Part Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
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
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="partType">Part Type</Label>
                <Select value={formData.partType || ''} onValueChange={(value) => handleInputChange('partType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select part type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OEM">OEM</SelectItem>
                    <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                    <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'pending'} onValueChange={(value) => handleInputChange('status', value)}>
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
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName || ''}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                />
              </div>
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
                  step="0.1"
                  min="0"
                  value={formData.markupPercentage}
                  onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="customerPrice">Customer Price *</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customerPrice}
                  onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="retailPrice">Retail Price</Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retailPrice}
                  onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price (Legacy)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isTaxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                />
                <Label htmlFor="isTaxable">Taxable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="coreChargeApplied"
                  checked={formData.coreChargeApplied}
                  onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                />
                <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
              </div>
              {formData.coreChargeApplied && (
                <div className="col-span-2">
                  <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                  <Input
                    id="coreChargeAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.coreChargeAmount}
                    onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details & Warranty</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                <Input
                  id="warrantyDuration"
                  value={formData.warrantyDuration || ''}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months, 2 years"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isStockItem"
                  checked={formData.isStockItem}
                  onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                />
                <Label htmlFor="isStockItem">Stock Item</Label>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory & Order Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="poLine">PO Line</Label>
                <Input
                  id="poLine"
                  value={formData.poLine || ''}
                  onChange={(e) => handleInputChange('poLine', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="inventoryItemId">Inventory Item ID</Label>
                <Input
                  id="inventoryItemId"
                  value={formData.inventoryItemId || ''}
                  onChange={(e) => handleInputChange('inventoryItemId', e.target.value)}
                  placeholder="Link to existing inventory item"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
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
