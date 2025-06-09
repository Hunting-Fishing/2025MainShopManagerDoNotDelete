
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';

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
    markupPercentage: 0,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [userAdjustment, setUserAdjustment] = useState<number>(0);

  // Calculate base markup percentage when supplier cost and retail price change
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.retailPrice > 0) {
      const baseMarkup = ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({ ...prev, markupPercentage: Math.round(baseMarkup * 100) / 100 }));
    } else {
      setFormData(prev => ({ ...prev, markupPercentage: 0 }));
    }
  }, [formData.supplierCost, formData.retailPrice]);

  // Calculate customer price based on retail price and user adjustment
  useEffect(() => {
    if (formData.retailPrice > 0) {
      const adjustmentMultiplier = 1 + (userAdjustment / 100);
      const newCustomerPrice = formData.retailPrice * adjustmentMultiplier;
      setFormData(prev => ({ ...prev, customerPrice: Math.round(newCustomerPrice * 100) / 100 }));
    }
  }, [formData.retailPrice, userAdjustment]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (supplier: string) => {
    setFormData(prev => ({ ...prev, supplierName: supplier }));
  };

  const handleUserAdjustmentChange = (value: number[]) => {
    setUserAdjustment(value[0]);
  };

  const handleSubmit = () => {
    if (formData.partName.trim() && formData.supplierCost > 0 && formData.retailPrice > 0) {
      onAddPart(formData);
      // Reset form
      setFormData({
        partName: '',
        partNumber: '',
        supplierName: '',
        supplierCost: 0,
        markupPercentage: 0,
        retailPrice: 0,
        customerPrice: 0,
        quantity: 1,
        partType: 'non-inventory',
        invoiceNumber: '',
        poLine: '',
        notes: ''
      });
      setUserAdjustment(0);
    }
  };

  const isFormValid = formData.partName.trim() && formData.supplierCost > 0 && formData.retailPrice > 0;
  const totalMarkup = formData.supplierCost > 0 ? ((formData.customerPrice - formData.supplierCost) / formData.supplierCost) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Part Identification */}
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

        {/* Supplier Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <SupplierSelector
              value={formData.supplierName || ''}
              onValueChange={handleSupplierChange}
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

        <Separator />

        {/* Pricing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplierCost">Supplier Cost *</Label>
            <Input
              id="supplierCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierCost || ''}
              onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail/List Price *</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice || ''}
              onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Markup Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseMarkup">Base Markup % (Supplier → Retail)</Label>
            <Input
              id="baseMarkup"
              type="number"
              step="0.01"
              value={formData.markupPercentage || ''}
              placeholder={formData.supplierCost > 0 && formData.retailPrice > 0 ? "Calculated automatically" : "Enter retail price first"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price</Label>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              value={formData.customerPrice || ''}
              placeholder="Calculated from retail + adjustment"
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        {/* User Adjustment Controls */}
        {formData.retailPrice > 0 && (
          <div className="space-y-4 p-4 border rounded-lg bg-green-50">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-green-800">
                User Adjustment Markup % (Retail → Customer): {userAdjustment.toFixed(1)}%
              </Label>
              <Slider
                value={[userAdjustment]}
                onValueChange={handleUserAdjustmentChange}
                max={200}
                min={-50}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-50%</span>
                <span>0%</span>
                <span>+200%</span>
              </div>
            </div>
            
            {formData.supplierCost > 0 && (
              <div className="text-sm space-y-1 bg-white p-3 rounded border">
                <div className="font-medium">Markup Summary:</div>
                <div>Base Markup: {formData.markupPercentage.toFixed(1)}% (${formData.supplierCost.toFixed(2)} → ${formData.retailPrice.toFixed(2)})</div>
                <div>User Adjustment: {userAdjustment.toFixed(1)}% (${formData.retailPrice.toFixed(2)} → ${formData.customerPrice.toFixed(2)})</div>
                <div className="font-medium text-green-700">Total Markup: {totalMarkup.toFixed(1)}%</div>
              </div>
            )}
          </div>
        )}

        {/* Quantity and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            className="min-w-32"
          >
            Add Part
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
