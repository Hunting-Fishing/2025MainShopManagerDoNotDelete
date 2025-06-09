
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Plus } from 'lucide-react';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 35,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [useSlider, setUseSlider] = useState(true);
  const [resetToRetail, setResetToRetail] = useState(false);

  // Calculate retail price from supplier cost and markup
  const calculateRetailPrice = (supplierCost: number, markup: number) => {
    return supplierCost * (1 + markup / 100);
  };

  // Calculate customer price (starts same as retail, can be manually adjusted)
  const calculateCustomerPrice = (retailPrice: number, resetToRetail: boolean) => {
    return resetToRetail ? retailPrice : formData.customerPrice || retailPrice;
  };

  const handleSupplierCostChange = (value: number) => {
    const newRetailPrice = calculateRetailPrice(value, formData.markupPercentage || 0);
    const newCustomerPrice = calculateCustomerPrice(newRetailPrice, resetToRetail);
    
    setFormData(prev => ({
      ...prev,
      supplierCost: value,
      retailPrice: newRetailPrice,
      customerPrice: newCustomerPrice
    }));
  };

  const handleMarkupChange = (value: number) => {
    const newRetailPrice = calculateRetailPrice(formData.supplierCost || 0, value);
    const newCustomerPrice = calculateCustomerPrice(newRetailPrice, resetToRetail);
    
    setFormData(prev => ({
      ...prev,
      markupPercentage: value,
      retailPrice: newRetailPrice,
      customerPrice: newCustomerPrice
    }));
  };

  const handleRetailPriceChange = (value: number) => {
    const newCustomerPrice = resetToRetail ? value : formData.customerPrice || value;
    
    setFormData(prev => ({
      ...prev,
      retailPrice: value,
      customerPrice: newCustomerPrice
    }));
  };

  const handleCustomerPriceChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      customerPrice: value
    }));
  };

  const handleResetToRetailToggle = (checked: boolean) => {
    setResetToRetail(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        customerPrice: prev.retailPrice || 0
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.partName?.trim()) {
      alert('Part name is required');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: formData.partName || '',
      partNumber: formData.partNumber || '',
      supplierName: formData.supplierName || '',
      supplierCost: formData.supplierCost || 0,
      markupPercentage: formData.markupPercentage || 0,
      retailPrice: formData.retailPrice || 0,
      customerPrice: formData.customerPrice || 0,
      quantity: formData.quantity || 1,
      partType: 'non-inventory',
      invoiceNumber: formData.invoiceNumber || '',
      poLine: formData.poLine || '',
      notes: formData.notes || ''
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 35,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      invoiceNumber: '',
      poLine: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            type="text"
            value={formData.partName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
            placeholder="Enter part name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            type="text"
            value={formData.partNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
            placeholder="Enter part number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierName">Supplier Name</Label>
        <Input
          id="supplierName"
          type="text"
          value={formData.supplierName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
          placeholder="Enter supplier name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity || 1}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.supplierCost || ''}
            onChange={(e) => handleSupplierCostChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail/List Price</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.retailPrice?.toFixed(2) || ''}
            onChange={(e) => handleRetailPriceChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="markupPercentage">Markup %</Label>
          {useSlider ? (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={formData.markupPercentage || 35}
                onChange={(e) => handleMarkupChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-sm text-center font-medium">
                {formData.markupPercentage || 35}%
              </div>
            </div>
          ) : (
            <Input
              id="markupPercentage"
              type="number"
              step="0.1"
              min="0"
              value={formData.markupPercentage || ''}
              onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 0)}
              placeholder="35"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="useSlider"
            checked={useSlider}
            onCheckedChange={setUseSlider}
          />
          <Label htmlFor="useSlider">Use Sliding Markup Scale</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="resetToRetail"
            checked={resetToRetail}
            onCheckedChange={handleResetToRetailToggle}
          />
          <Label htmlFor="resetToRetail">Reset to Retail</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPrice">Customer Price</Label>
        <Input
          id="customerPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.customerPrice?.toFixed(2) || ''}
          onChange={(e) => handleCustomerPriceChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={resetToRetail ? "bg-orange-50" : ""}
        />
        {resetToRetail && (
          <p className="text-sm text-orange-600">
            Markup calculation override (${formData.retailPrice?.toFixed(2)})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice #</Label>
          <Input
            id="invoiceNumber"
            type="text"
            value={formData.invoiceNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            placeholder="Enter invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            type="text"
            value={formData.poLine || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, poLine: e.target.value }))}
            placeholder="Enter PO line"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes"
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Part
      </Button>
    </div>
  );
}
