
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SupplierSelector } from './SupplierSelector';
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
    markupPercentage: 0,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [isUserAdjusted, setIsUserAdjusted] = useState(false);

  // Calculate retail price based on supplier cost and markup
  useEffect(() => {
    if (!isUserAdjusted && formData.supplierCost && formData.markupPercentage) {
      const calculatedRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: calculatedRetailPrice,
        customerPrice: calculatedRetailPrice
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage, isUserAdjusted]);

  // Calculate markup percentage when retail price or customer price changes manually
  useEffect(() => {
    if (isUserAdjusted && formData.supplierCost && formData.retailPrice) {
      const calculatedMarkup = ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({
        ...prev,
        markupPercentage: calculatedMarkup
      }));
    }
  }, [formData.retailPrice, formData.supplierCost, isUserAdjusted]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    // Mark as user adjusted if they're changing retail or customer price
    if (field === 'retailPrice' || field === 'customerPrice') {
      setIsUserAdjusted(true);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSupplierChange = (supplier: string) => {
    handleInputChange('supplierName', supplier);
  };

  const handleSubmit = () => {
    if (!formData.partName) {
      alert('Part name is required');
      return;
    }

    const partToAdd: WorkOrderPartFormValues = {
      partName: formData.partName || '',
      partNumber: formData.partNumber,
      supplierName: formData.supplierName,
      supplierCost: Number(formData.supplierCost) || 0,
      markupPercentage: Number(formData.markupPercentage) || 0,
      retailPrice: Number(formData.retailPrice) || 0,
      customerPrice: Number(formData.customerPrice) || 0,
      quantity: Number(formData.quantity) || 1,
      partType: 'non-inventory',
      invoiceNumber: formData.invoiceNumber,
      poLine: formData.poLine,
      notes: formData.notes
    };

    onAddPart(partToAdd);
    
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
    setIsUserAdjusted(false);
  };

  const resetToCalculated = () => {
    setIsUserAdjusted(false);
    if (formData.supplierCost && formData.markupPercentage) {
      const calculatedRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: calculatedRetailPrice,
        customerPrice: calculatedRetailPrice
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Non-Inventory Part</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Part Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
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

          {/* Purchase Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice #</Label>
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

          {/* Supplier and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Supplier</Label>
              <SupplierSelector
                value={formData.supplierName || ''}
                onChange={handleSupplierChange}
                placeholder="Select or enter supplier"
              />
            </div>
            <div>
              <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="markupPercentage">Base Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                value={formData.retailPrice > 0 ? formData.markupPercentage?.toFixed(2) : ''}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder={formData.retailPrice > 0 ? "0.00" : "Enter retail price first"}
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="retailPrice">Retail/List Price ($)</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="customerPrice">Customer Price ($)</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* User Adjustment Section */}
          {isUserAdjusted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800">Price Manually Adjusted</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetToCalculated}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Reset to Calculated
                </Button>
              </div>
              <p className="text-sm text-green-700">
                You've manually adjusted the pricing. The markup percentage has been recalculated based on your retail price of ${formData.retailPrice?.toFixed(2)} vs supplier cost of ${formData.supplierCost?.toFixed(2)}.
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this part"
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Part Summary</h4>
            <div className="text-sm space-y-1">
              <p><strong>Part:</strong> {formData.partName || 'Not specified'}</p>
              <p><strong>Quantity:</strong> {formData.quantity}</p>
              <p><strong>Unit Price:</strong> ${(formData.customerPrice || 0).toFixed(2)}</p>
              <p><strong>Total:</strong> ${((formData.customerPrice || 0) * (formData.quantity || 1)).toFixed(2)}</p>
              {formData.supplierCost > 0 && (
                <p><strong>Markup:</strong> {(formData.markupPercentage || 0).toFixed(1)}%</p>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Part to Work Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
