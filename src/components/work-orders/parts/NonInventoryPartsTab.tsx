
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
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    partType: 'non-inventory',
    quantity: 1,
    markupPercentage: 30,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    status: 'ordered',
    isStockItem: false,
    supplierCost: 0,
    retailPrice: 0,
    customerPrice: 0
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    const newData = { ...formData, [field]: value };

    // Auto-calculate prices when supplier cost or markup changes
    if (field === 'supplierCost' || field === 'markupPercentage') {
      const supplierCost = field === 'supplierCost' ? value : newData.supplierCost || 0;
      const markupPercentage = field === 'markupPercentage' ? value : newData.markupPercentage || 0;
      
      const retailPrice = supplierCost * (1 + markupPercentage / 100);
      newData.retailPrice = retailPrice;
      newData.customerPrice = retailPrice;
    }

    setFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName) {
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: formData.partName || '',
      partNumber: formData.partNumber,
      supplierName: formData.supplierName,
      supplierCost: formData.supplierCost || 0,
      supplierSuggestedRetailPrice: formData.supplierSuggestedRetailPrice,
      markupPercentage: formData.markupPercentage || 0,
      retailPrice: formData.retailPrice || 0,
      customerPrice: formData.customerPrice || 0,
      quantity: formData.quantity || 1,
      partType: 'non-inventory',
      invoiceNumber: formData.invoiceNumber,
      poLine: formData.poLine,
      notes: formData.notes,
      category: formData.category,
      isTaxable: formData.isTaxable ?? true,
      coreChargeAmount: formData.coreChargeAmount || 0,
      coreChargeApplied: formData.coreChargeApplied || false,
      warrantyDuration: formData.warrantyDuration,
      installDate: formData.installDate,
      installedBy: formData.installedBy,
      status: formData.status || 'ordered',
      isStockItem: false,
      notesInternal: formData.notesInternal
    };

    onAddPart(partData);

    // Reset form
    setFormData({
      partType: 'non-inventory',
      quantity: 1,
      markupPercentage: 30,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered',
      isStockItem: false,
      supplierCost: 0,
      retailPrice: 0,
      customerPrice: 0
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName || ''}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PART_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier</Label>
              <Input
                id="supplierName"
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                value={formData.supplierCost || ''}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierSuggestedRetailPrice">Supplier MSRP</Label>
              <Input
                id="supplierSuggestedRetailPrice"
                type="number"
                step="0.01"
                value={formData.supplierSuggestedRetailPrice || ''}
                onChange={(e) => handleInputChange('supplierSuggestedRetailPrice', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                value={formData.markupPercentage || ''}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                value={formData.customerPrice || ''}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || 1}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'ordered'} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
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

            {/* Order Tracking */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={formData.poLine || ''}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Enter PO line"
              />
            </div>

            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warrantyDuration">Warranty</Label>
              <Select value={formData.warrantyDuration || ''} onValueChange={(value) => handleInputChange('warrantyDuration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty" />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installDate">Install Date</Label>
              <Input
                id="installDate"
                type="date"
                value={formData.installDate || ''}
                onChange={(e) => handleInputChange('installDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installedBy">Installed By</Label>
              <Input
                id="installedBy"
                value={formData.installedBy || ''}
                onChange={(e) => handleInputChange('installedBy', e.target.value)}
                placeholder="Enter installer name"
              />
            </div>

            {/* Core Charge */}
            <div className="space-y-2">
              <Label htmlFor="coreChargeAmount">Core Charge</Label>
              <Input
                id="coreChargeAmount"
                type="number"
                step="0.01"
                value={formData.coreChargeAmount || ''}
                onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTaxable"
                checked={formData.isTaxable ?? true}
                onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="coreChargeApplied"
                checked={formData.coreChargeApplied || false}
                onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
              />
              <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about this part"
              rows={3}
            />
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
