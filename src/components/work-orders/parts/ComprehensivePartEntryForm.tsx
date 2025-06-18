
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { CategorySelector } from './CategorySelector';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  isLoading = false 
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
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
    isStockItem: true,
    notesInternal: '',
    partType: 'OEM'
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPartAdd(formData);
  };

  const calculateCustomerPrice = () => {
    if (formData.supplierCost && formData.markupPercentage) {
      const markup = formData.supplierCost * (formData.markupPercentage / 100);
      const calculatedPrice = formData.supplierCost + markup;
      handleInputChange('customerPrice', Number(calculatedPrice.toFixed(2)));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Part Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter part name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="part_number">Part Number *</Label>
            <Input
              id="part_number"
              value={formData.part_number}
              onChange={(e) => handleInputChange('part_number', e.target.value)}
              placeholder="Enter part number"
              required
            />
          </div>
        </div>

        <CategorySelector
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
        />

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter part description"
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* Quantity & Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quantity & Pricing</h3>
        
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="markupPercentage">Markup %</Label>
            <div className="flex gap-2">
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                min="0"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={calculateCustomerPrice}
                disabled={!formData.supplierCost || !formData.markupPercentage}
              >
                Calc
              </Button>
            </div>
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
      </div>

      <Separator />

      {/* Supplier Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Supplier Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>
          
          <div>
            <Label htmlFor="partType">Part Type</Label>
            <Select
              value={formData.partType}
              onValueChange={(value) => handleInputChange('partType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OEM">OEM</SelectItem>
                <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
          
          <div>
            <Label htmlFor="poLine">PO Line</Label>
            <Input
              id="poLine"
              value={formData.poLine}
              onChange={(e) => handleInputChange('poLine', e.target.value)}
              placeholder="Enter PO line"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
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
          
          <div>
            <Label htmlFor="warrantyDuration">Warranty Duration</Label>
            <Input
              id="warrantyDuration"
              value={formData.warrantyDuration}
              onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
              placeholder="e.g., 12 months, 2 years"
            />
          </div>
        </div>

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
          
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="coreChargeApplied"
              checked={formData.coreChargeApplied}
              onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
            />
            <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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
              id="isStockItem"
              checked={formData.isStockItem}
              onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
            />
            <Label htmlFor="isStockItem">Stock Item</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes</h3>
        
        <div>
          <Label htmlFor="notes">Customer Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Notes visible to customer"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="notesInternal">Internal Notes</Label>
          <Textarea
            id="notesInternal"
            value={formData.notesInternal}
            onChange={(e) => handleInputChange('notesInternal', e.target.value)}
            placeholder="Internal notes (not visible to customer)"
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.name || !formData.part_number}
        >
          {isLoading ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
