import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (partData: WorkOrderPartFormValues) => void;
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
    name: '',
    partNumber: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    status: 'pending',
    notes: '',
    category: '',
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    warrantyExpiryDate: '',
    installDate: '',
    installedBy: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    supplierOrderRef: '',
    notesInternal: '',
    inventoryItemId: '',
    partType: '',
    estimatedArrivalDate: '',
    itemStatus: ''
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateMarkup = () => {
    if (formData.supplierCost && formData.customerPrice) {
      const markup = ((formData.customerPrice - formData.supplierCost) / formData.supplierCost) * 100;
      handleInputChange('markupPercentage', Math.round(markup * 100) / 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map camelCase form values to snake_case for database submission
    const partData: WorkOrderPartFormValues = {
      name: formData.name,
      part_number: formData.partNumber,
      description: formData.description,
      quantity: formData.quantity,
      unit_price: formData.unitPrice,
      status: formData.status,
      notes: formData.notes,
      job_line_id: jobLineId,
      category: formData.category,
      customerPrice: formData.customerPrice,
      supplierCost: formData.supplierCost,
      retailPrice: formData.retailPrice,
      markupPercentage: formData.markupPercentage,
      isTaxable: formData.isTaxable,
      coreChargeAmount: formData.coreChargeAmount,
      coreChargeApplied: formData.coreChargeApplied,
      warrantyDuration: formData.warrantyDuration,
      warrantyExpiryDate: formData.warrantyExpiryDate,
      installDate: formData.installDate,
      installedBy: formData.installedBy,
      invoiceNumber: formData.invoiceNumber,
      poLine: formData.poLine,
      isStockItem: formData.isStockItem,
      supplierName: formData.supplierName,
      supplierOrderRef: formData.supplierOrderRef,
      notesInternal: formData.notesInternal,
      inventoryItemId: formData.inventoryItemId,
      partType: formData.partType,
      estimatedArrivalDate: formData.estimatedArrivalDate,
      itemStatus: formData.itemStatus
    };

    onPartAdd(partData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
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
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ORDER_PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category and Supplier Section */}
      <Card>
        <CardHeader>
          <CardTitle>Category & Supplier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelector
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            />
            <SupplierSelector
              value={formData.supplierName}
              onValueChange={(value) => handleInputChange('supplierName', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                onBlur={calculateMarkup}
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
                onBlur={calculateMarkup}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="markupPercentage">Markup Percentage</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                readOnly
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isTaxable"
                checked={formData.isTaxable}
                onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
              />
              <Label htmlFor="isTaxable">Taxable Item</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="warranty" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
              <TabsTrigger value="core">Core Charge</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="warranty" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                  <Input
                    id="warrantyDuration"
                    value={formData.warrantyDuration || ''}
                    onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                    placeholder="e.g., 12 months, 2 years"
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyExpiryDate">Warranty Expiry Date</Label>
                  <Input
                    id="warrantyExpiryDate"
                    type="date"
                    value={formData.warrantyExpiryDate || ''}
                    onChange={(e) => handleInputChange('warrantyExpiryDate', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="core" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coreChargeApplied"
                    checked={formData.coreChargeApplied}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partType">Part Type</Label>
                  <Select value={formData.partType} onValueChange={(value) => handleInputChange('partType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OEM">OEM</SelectItem>
                      <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                      <SelectItem value="Rebuilt">Rebuilt</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isStockItem"
                    checked={formData.isStockItem}
                    onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                  />
                  <Label htmlFor="isStockItem">Stock Item</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Notes visible to customer..."
                />
              </div>
              <div>
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  rows={3}
                  placeholder="Internal notes (not visible to customer)..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
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
