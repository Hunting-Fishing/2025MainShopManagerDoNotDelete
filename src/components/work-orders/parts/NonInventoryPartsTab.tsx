
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Percent } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Omit<WorkOrderPartFormValues, 'partType'>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 50,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [useMarkupScale, setUseMarkupScale] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate markup percentage when retail or supplier cost changes (for display only)
  const calculateDisplayMarkup = (supplierCost: number, retailPrice: number): number => {
    if (supplierCost === 0) return 0;
    return ((retailPrice - supplierCost) / supplierCost) * 100;
  };

  // Calculate customer price based on retail price and markup
  const calculateCustomerPrice = (retailPrice: number, markupPercentage: number): number => {
    return retailPrice + (retailPrice * (markupPercentage / 100));
  };

  const handleSupplierCostChange = (value: string) => {
    const cost = parseFloat(value) || 0;
    setFormData(prev => {
      const newData = { ...prev, supplierCost: cost };
      
      // Only update markup percentage for display purposes if retail price exists
      if (prev.retailPrice > 0) {
        newData.markupPercentage = calculateDisplayMarkup(cost, prev.retailPrice);
      }
      
      return newData;
    });
  };

  const handleRetailPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setFormData(prev => {
      const newData = { ...prev, retailPrice: price };
      
      // Update markup percentage for display purposes
      if (prev.supplierCost > 0) {
        newData.markupPercentage = calculateDisplayMarkup(prev.supplierCost, price);
      }
      
      // Update customer price if markup scale is enabled
      if (useMarkupScale) {
        newData.customerPrice = calculateCustomerPrice(price, prev.markupPercentage);
      }
      
      return newData;
    });
  };

  const handleMarkupChange = (value: number[]) => {
    const markup = value[0];
    setFormData(prev => {
      const newData = { ...prev, markupPercentage: markup };
      
      // Only update customer price, never retail price
      if (useMarkupScale) {
        newData.customerPrice = calculateCustomerPrice(prev.retailPrice, markup);
      }
      
      return newData;
    });
  };

  const handleMarkupInputChange = (value: string) => {
    const markup = parseFloat(value) || 0;
    setFormData(prev => {
      const newData = { ...prev, markupPercentage: markup };
      
      // Only update customer price, never retail price
      if (useMarkupScale) {
        newData.customerPrice = calculateCustomerPrice(prev.retailPrice, markup);
      }
      
      return newData;
    });
  };

  const handleCustomerPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, customerPrice: price }));
  };

  const handleMarkupScaleToggle = (enabled: boolean) => {
    setUseMarkupScale(enabled);
    
    if (enabled) {
      // Recalculate customer price based on current retail price and markup
      setFormData(prev => ({
        ...prev,
        customerPrice: calculateCustomerPrice(prev.retailPrice, prev.markupPercentage)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.partName.trim()) {
      newErrors.partName = 'Part name is required';
    }

    if (formData.supplierCost < 0) {
      newErrors.supplierCost = 'Supplier cost cannot be negative';
    }

    if (formData.retailPrice < 0) {
      newErrors.retailPrice = 'Retail price cannot be negative';
    }

    if (formData.customerPrice < 0) {
      newErrors.customerPrice = 'Customer price cannot be negative';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      ...formData,
      partType: 'non-inventory'
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 50,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      invoiceNumber: '',
      poLine: '',
      notes: ''
    });
    
    toast.success('Part added successfully');
  };

  return (
    <div className="space-y-6">
      {/* Part Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
            onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
            placeholder="Enter part name"
            className={errors.partName ? 'border-red-500' : ''}
          />
          {errors.partName && <p className="text-sm text-red-500">{errors.partName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
            placeholder="Enter part number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName}
            onChange={(value) => setFormData(prev => ({ ...prev, supplierName: value }))}
            placeholder="Select or add supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
        </div>
      </div>

      <Separator />

      {/* Pricing Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4" />
            <h3 className="text-lg font-medium">Pricing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => handleSupplierCostChange(e.target.value)}
                placeholder="0.00"
                className={errors.supplierCost ? 'border-red-500' : ''}
              />
              {errors.supplierCost && <p className="text-sm text-red-500">{errors.supplierCost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail/List Price</Label>
              <Input
                id="retailPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => handleRetailPriceChange(e.target.value)}
                placeholder="0.00"
                className={errors.retailPrice ? 'border-red-500' : ''}
              />
              {errors.retailPrice && <p className="text-sm text-red-500">{errors.retailPrice}</p>}
            </div>
          </div>

          {/* Markup Scale Toggle */}
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span className="text-sm font-medium">Use Markup Scale for Customer Price</span>
            </div>
            <Switch
              checked={useMarkupScale}
              onCheckedChange={handleMarkupScaleToggle}
            />
          </div>

          {/* Markup Controls */}
          {useMarkupScale && (
            <div className="space-y-4 mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="markupInput">Markup Percentage</Label>
                  <Input
                    id="markupInput"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.markupPercentage.toFixed(1)}
                    onChange={(e) => handleMarkupInputChange(e.target.value)}
                    placeholder="50.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Markup Slider</Label>
                  <Slider
                    value={[formData.markupPercentage]}
                    onValueChange={handleMarkupChange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>{formData.markupPercentage.toFixed(1)}%</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Price */}
          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price</Label>
            <Input
              id="customerPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.customerPrice}
              onChange={(e) => handleCustomerPriceChange(e.target.value)}
              placeholder="0.00"
              disabled={useMarkupScale}
              className={`${errors.customerPrice ? 'border-red-500' : ''} ${useMarkupScale ? 'bg-gray-100' : ''}`}
            />
            {useMarkupScale && (
              <p className="text-xs text-gray-600">Customer price is calculated automatically based on retail price and markup</p>
            )}
            {errors.customerPrice && <p className="text-sm text-red-500">{errors.customerPrice}</p>}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            placeholder="Enter invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            value={formData.poLine}
            onChange={(e) => setFormData(prev => ({ ...prev, poLine: e.target.value }))}
            placeholder="Enter PO line"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this part"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="px-6">
          Add Part
        </Button>
      </div>
    </div>
  );
}
