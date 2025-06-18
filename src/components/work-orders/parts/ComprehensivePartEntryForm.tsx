
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { Checkbox } from '@/components/ui/checkbox';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => Promise<void>;
  onCancel?: () => void;
  workOrderId?: string;
  jobLineId?: string;
  isLoading?: boolean;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  workOrderId, 
  jobLineId,
  isLoading = false 
}: ComprehensivePartEntryFormProps) {
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
    inventoryItemId: '',
    job_line_id: jobLineId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.part_number || !formData.name || !formData.unit_price) {
      return;
    }
    
    try {
      await onPartAdd(formData);
    } catch (error) {
      console.error('Error submitting part:', error);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const calculateTotalPrice = () => {
    return (formData.quantity * formData.unit_price).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    required
                    placeholder="Enter part number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Enter part name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter part description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <Label>Total Price</Label>
                  <Input
                    value={`$${calculateTotalPrice()}`}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="installed">Installed</SelectItem>
                    <SelectItem value="backordered">Backordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="markupPercentage">Markup %</Label>
                  <Input
                    id="markupPercentage"
                    type="number"
                    min="0"
                    value={formData.markupPercentage || 0}
                    onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPrice">Customer Price</Label>
                  <Input
                    id="customerPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.customerPrice || 0}
                    onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="coreChargeApplied"
                    checked={formData.coreChargeApplied}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTaxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                />
                <Label htmlFor="isTaxable">Taxable Item</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category & Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CategorySelector
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                />
                <SupplierSelector
                  value={formData.supplierName}
                  onValueChange={(value) => handleInputChange('supplierName', value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                <Input
                  id="warrantyDuration"
                  value={formData.warrantyDuration || ''}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any notes about this part"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  placeholder="Internal notes (not visible to customer)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partType">Part Type</Label>
                  <Select 
                    value={formData.partType} 
                    onValueChange={(value) => handleInputChange('partType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select part type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oem">OEM</SelectItem>
                      <SelectItem value="aftermarket">Aftermarket</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="remanufactured">Remanufactured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryItemId">Inventory Item ID</Label>
                  <Input
                    id="inventoryItemId"
                    value={formData.inventoryItemId || ''}
                    onChange={(e) => handleInputChange('inventoryItemId', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStockItem"
                  checked={formData.isStockItem}
                  onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                />
                <Label htmlFor="isStockItem">Stock Item</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
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
          disabled={isLoading || !formData.part_number || !formData.name || !formData.unit_price}
        >
          {isLoading ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
