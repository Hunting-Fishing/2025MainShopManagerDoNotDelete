
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ 
  workOrderId, 
  jobLineId, 
  onAddPart 
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    supplierSuggestedRetailPrice: 0,
    markupPercentage: 50,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: '',
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    installDate: '',
    installedBy: '',
    status: 'ordered',
    isStockItem: false,
    notesInternal: ''
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate retail price when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage;
        updated.retailPrice = cost * (1 + markup / 100);
        updated.customerPrice = updated.retailPrice; // Default customer price to retail
      }
      
      // Auto-calculate customer total when quantity changes
      if (field === 'quantity' || field === 'retailPrice') {
        const qty = field === 'quantity' ? value : updated.quantity;
        const price = field === 'retailPrice' ? value : updated.retailPrice;
        updated.customerPrice = price; // Keep unit price, total calculated elsewhere
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partName.trim()) return;
    
    onAddPart(formData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 50,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      invoiceNumber: '',
      poLine: '',
      notes: '',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      installDate: '',
      installedBy: '',
      status: 'ordered',
      isStockItem: false,
      notesInternal: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Part Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <SupplierSelector
                value={formData.supplierName || ''}
                onChange={(supplierName) => handleInputChange('supplierName', supplierName)}
                placeholder="Select or add supplier"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PART_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Information */}
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
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                min="0"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="50"
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
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Status and Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="warrantyDuration">Warranty Duration</Label>
              <Select value={formData.warrantyDuration} onValueChange={(value) => handleInputChange('warrantyDuration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty" />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTaxable"
                checked={Boolean(formData.isTaxable)}
                onCheckedChange={(checked) => handleInputChange('isTaxable', Boolean(checked))}
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="coreChargeApplied"
                checked={Boolean(formData.coreChargeApplied)}
                onCheckedChange={(checked) => handleInputChange('coreChargeApplied', Boolean(checked))}
              />
              <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isStockItem"
                checked={Boolean(formData.isStockItem)}
                onCheckedChange={(checked) => handleInputChange('isStockItem', Boolean(checked))}
              />
              <Label htmlFor="isStockItem">Stock Item</Label>
            </div>
          </div>

          {/* Core Charge Amount (conditional) */}
          {formData.coreChargeApplied && (
            <div>
              <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
              <Input
                id="coreChargeAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.coreChargeAmount}
                onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Additional Information */}
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

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Customer Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter customer-visible notes"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="notesInternal">Internal Notes</Label>
            <Textarea
              id="notesInternal"
              value={formData.notesInternal}
              onChange={(e) => handleInputChange('notesInternal', e.target.value)}
              placeholder="Enter internal notes"
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Unit Price:</span>
              <span>${formData.customerPrice.toFixed(2)}</span>
              <span>Quantity:</span>
              <span>{formData.quantity}</span>
              <span className="font-medium">Total:</span>
              <span className="font-medium">${(formData.customerPrice * formData.quantity).toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
