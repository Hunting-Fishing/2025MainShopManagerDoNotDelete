import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
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
    notes: '',
  });

  const [userAdjustmentMarkup, setUserAdjustmentMarkup] = useState<number>(0);
  const [baseMarkupCalculated, setBaseMarkupCalculated] = useState<boolean>(false);

  useEffect(() => {
    if (formData.supplierCost > 0 && formData.retailPrice > 0) {
      const calculatedMarkup = ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({ ...prev, markupPercentage: Number(calculatedMarkup.toFixed(2)) }));
      setBaseMarkupCalculated(true);
    } else {
      setFormData(prev => ({ ...prev, markupPercentage: 0 }));
      setBaseMarkupCalculated(false);
    }
  }, [formData.supplierCost, formData.retailPrice]);

  useEffect(() => {
    const totalMarkup = formData.markupPercentage + userAdjustmentMarkup;
    const newCustomerPrice = formData.supplierCost * (1 + totalMarkup / 100);
    setFormData(prev => ({ ...prev, customerPrice: Number(newCustomerPrice.toFixed(2)) }));
  }, [formData.markupPercentage, userAdjustmentMarkup, formData.supplierCost]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.partName && formData.supplierCost > 0) {
      onAddPart(formData);
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
        notes: '',
      });
      setUserAdjustmentMarkup(0);
      setBaseMarkupCalculated(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Part Information */}
          <div className="grid grid-cols-2 gap-4">
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
                value={formData.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
          </div>

          {/* Supplier and Purchase Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <SupplierSelector
                value={formData.supplierName || ''}
                onChange={(supplier) => handleInputChange('supplierName', supplier)}
                placeholder="Select or enter supplier"
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Invoice number"
              />
            </div>
            <div>
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={formData.poLine || ''}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Purchase order line"
              />
            </div>
          </div>

          {/* Cost and Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost *</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="retailPrice">Retail / List Price</Label>
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

          {/* Base Markup and Customer Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseMarkup">Base Markup %</Label>
              <Input
                id="baseMarkup"
                type="number"
                step="0.01"
                value={baseMarkupCalculated ? formData.markupPercentage : ''}
                placeholder={baseMarkupCalculated ? undefined : "Enter Retail Price to calculate"}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                value={formData.customerPrice}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* User Adjustment Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-green-800 font-medium">User Adjustment Markup %</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUserAdjustmentMarkup(prev => Math.max(prev - 1, -100))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  step="0.1"
                  value={userAdjustmentMarkup}
                  onChange={(e) => setUserAdjustmentMarkup(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center bg-green-100 border-green-300"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUserAdjustmentMarkup(prev => prev + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Enhanced Summary */}
            <div className="text-sm space-y-1 text-green-700">
              <div className="flex justify-between">
                <span>Base Markup:</span>
                <span>{formData.markupPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>User Adjustment:</span>
                <span>{userAdjustmentMarkup > 0 ? '+' : ''}{userAdjustmentMarkup.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between font-medium border-t border-green-300 pt-1">
                <span>Total Markup:</span>
                <span>{(formData.markupPercentage + userAdjustmentMarkup).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Final Customer Price:</span>
                <span>${formData.customerPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quantity and Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes"
                className="min-h-[40px]"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Part
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
