
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, WARRANTY_DURATIONS, PART_STATUSES } from '@/types/workOrderPart';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    supplierSuggestedRetailPrice: 0, // New field
    markupPercentage: 30,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: '',
    category: 'Other',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: 'No Warranty',
    installDate: '',
    installedBy: '',
    status: 'ordered',
    isStockItem: false,
    notesInternal: ''
  });

  // Calculate retail price when supplier cost or markup changes
  React.useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage > 0) {
      const calculatedRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: Number(calculatedRetailPrice.toFixed(2)),
        customerPrice: Number(calculatedRetailPrice.toFixed(2))
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.partName.trim()) {
      alert('Part name is required');
      return;
    }

    if (formData.supplierCost <= 0) {
      alert('Supplier cost must be greater than 0');
      return;
    }

    onAddPart(formData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 30,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      invoiceNumber: '',
      poLine: '',
      notes: '',
      category: 'Other',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: 'No Warranty',
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
      <CardContent className="space-y-4">
        {/* Basic Part Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              value={formData.partName}
              onChange={(e) => handleInputChange('partName', e.target.value)}
              placeholder="Enter part name"
            />
          </div>
          
          <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="supplierName">Supplier Name</Label>
          <Input
            id="supplierName"
            value={formData.supplierName}
            onChange={(e) => handleInputChange('supplierName', e.target.value)}
            placeholder="Enter supplier name"
          />
        </div>

        {/* Pricing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplierCost">Supplier Cost *</Label>
            <Input
              id="supplierCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierCost}
              onChange={(e) => handleInputChange('supplierCost', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierSuggestedRetailPrice">Supplier Suggested Retail Price</Label>
            <Input
              id="supplierSuggestedRetailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierSuggestedRetailPrice}
              onChange={(e) => handleInputChange('supplierSuggestedRetailPrice', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="markupPercentage">Markup %</Label>
            <Input
              id="markupPercentage"
              type="number"
              step="1"
              min="0"
              value={formData.markupPercentage}
              onChange={(e) => handleInputChange('markupPercentage', Number(e.target.value))}
              placeholder="30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail Price</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice}
              onChange={(e) => handleInputChange('retailPrice', Number(e.target.value))}
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
              value={formData.customerPrice}
              onChange={(e) => handleInputChange('customerPrice', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Quantity and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              placeholder="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
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

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="poLine">PO Line</Label>
            <Input
              id="poLine"
              value={formData.poLine}
              onChange={(e) => handleInputChange('poLine', e.target.value)}
              placeholder="Enter PO line"
            />
          </div>
        </div>

        {/* Status and Warranty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {PART_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="warrantyDuration">Warranty Duration</Label>
            <Select
              value={formData.warrantyDuration}
              onValueChange={(value) => handleInputChange('warrantyDuration', value)}
            >
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

        {/* Installation Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="installDate">Install Date</Label>
            <Input
              id="installDate"
              type="date"
              value={formData.installDate}
              onChange={(e) => handleInputChange('installDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="installedBy">Installed By</Label>
            <Input
              id="installedBy"
              value={formData.installedBy}
              onChange={(e) => handleInputChange('installedBy', e.target.value)}
              placeholder="Enter installer name"
            />
          </div>
        </div>

        {/* Core Charge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
            <Input
              id="coreChargeAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.coreChargeAmount}
              onChange={(e) => handleInputChange('coreChargeAmount', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="coreChargeApplied"
              checked={formData.coreChargeApplied}
              onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
            />
            <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              id="isStockItem"
              checked={formData.isStockItem}
              onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
            />
            <Label htmlFor="isStockItem">Stock Item</Label>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Customer Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter customer-visible notes"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notesInternal">Internal Notes</Label>
          <Textarea
            id="notesInternal"
            value={formData.notesInternal}
            onChange={(e) => handleInputChange('notesInternal', e.target.value)}
            placeholder="Enter internal notes"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
