
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { SupplierSelector } from './SupplierSelector';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface NonInventoryPartsTabProps {
  onSubmit: (formData: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function NonInventoryPartsTab({ onSubmit, onCancel, isSubmitting = false }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 0, // Changed from 50 to 0 (blank)
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [userAdjustmentPercent, setUserAdjustmentPercent] = useState(0);

  // Calculate retail price when supplier cost or markup changes
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage > 0) {
      const newRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: Number(newRetailPrice.toFixed(2))
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  // Calculate customer price when retail price or user adjustment changes
  useEffect(() => {
    if (formData.retailPrice > 0) {
      const newCustomerPrice = formData.retailPrice * (1 + userAdjustmentPercent / 100);
      setFormData(prev => ({
        ...prev,
        customerPrice: Number(newCustomerPrice.toFixed(2))
      }));
    }
  }, [formData.retailPrice, userAdjustmentPercent]);

  // Calculate base markup percentage when supplier cost and retail price are both set
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.retailPrice > 0) {
      const calculatedMarkup = ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({
        ...prev,
        markupPercentage: Number(calculatedMarkup.toFixed(2))
      }));
    }
  }, [formData.supplierCost, formData.retailPrice]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.partName.trim() && formData.supplierCost > 0 && formData.quantity > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Part Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
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
      </div>

      {/* Supplier and Purchase Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName || ''}
            onChange={(supplier: string) => handleInputChange('supplierName', supplier)}
            placeholder="Select or add supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice #</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber || ''}
            onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            placeholder="Invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            value={formData.poLine || ''}
            onChange={(e) => handleInputChange('poLine', e.target.value)}
            placeholder="Purchase order line"
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost *</Label>
          <Input
            id="supplierCost"
            type="number"
            min="0"
            step="0.01"
            value={formData.supplierCost}
            onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail/List Price</Label>
          <Input
            id="retailPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.retailPrice}
            onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Base Markup Display */}
      {formData.supplierCost > 0 && formData.retailPrice > 0 && (
        <div className="space-y-2">
          <Label>Base Markup % (Supplier → Retail)</Label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-lg font-semibold text-blue-800">
              {formData.markupPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600">
              ${formData.supplierCost.toFixed(2)} → ${formData.retailPrice.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Customer Price and User Adjustment Section */}
      {formData.retailPrice > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-green-800 font-medium">User Adjustment Markup % (Retail → Customer)</Label>
                <div className="text-lg font-semibold text-green-800">
                  {userAdjustmentPercent.toFixed(1)}%
                </div>
              </div>
              
              <Slider
                value={[userAdjustmentPercent]}
                onValueChange={(value) => setUserAdjustmentPercent(value[0])}
                max={200}
                min={-50}
                step={0.5}
                className="w-full"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPrice">Customer Price</Label>
                  <Input
                    id="customerPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.customerPrice}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value) || 0;
                      handleInputChange('customerPrice', newPrice);
                      // Calculate adjustment percentage when customer price is manually changed
                      if (formData.retailPrice > 0) {
                        const newAdjustment = ((newPrice - formData.retailPrice) / formData.retailPrice) * 100;
                        setUserAdjustmentPercent(Number(newAdjustment.toFixed(2)));
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>

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
              </div>

              {/* Pricing Summary */}
              <div className="bg-white p-3 rounded border border-green-200">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Retail Price:</span>
                    <span className="font-medium">${formData.retailPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjustment ({userAdjustmentPercent.toFixed(1)}%):</span>
                    <span className={userAdjustmentPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {userAdjustmentPercent >= 0 ? '+' : ''}${((formData.retailPrice * userAdjustmentPercent) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Customer Price:</span>
                    <span>${formData.customerPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this part..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
