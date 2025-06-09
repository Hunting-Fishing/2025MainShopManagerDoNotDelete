
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

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

  const [useMarkupScale, setUseMarkupScale] = useState(false);

  // Calculate original markup percentage (Supplier Cost vs Retail Price)
  const originalMarkupPercentage = formData.supplierCost > 0 && formData.retailPrice > 0 
    ? ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100 
    : 0;

  // Calculate current/effective markup percentage (Retail Price vs Customer Price)
  const currentMarkupPercentage = formData.retailPrice > 0 && formData.customerPrice > 0
    ? ((formData.customerPrice - formData.retailPrice) / formData.retailPrice) * 100
    : 0;

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = { ...prev, [field]: numericValue };
      
      // Auto-calculate retail price when supplier cost or markup changes (and retail price is 0)
      if ((field === 'supplierCost' || field === 'markupPercentage') && prev.retailPrice === 0) {
        if (updated.supplierCost > 0 && updated.markupPercentage >= 0) {
          updated.retailPrice = updated.supplierCost * (1 + updated.markupPercentage / 100);
        }
      }
      
      // When using markup scale, calculate customer price from retail price and markup
      if (useMarkupScale && field === 'markupPercentage' && updated.retailPrice > 0) {
        updated.customerPrice = updated.retailPrice * (1 + updated.markupPercentage / 100);
      }
      
      // When customer price changes manually, don't auto-calculate from markup
      // This allows independent customer price adjustment
      
      return updated;
    });
  };

  const handleMarkupSliderChange = (value: number[]) => {
    const markupValue = value[0];
    setFormData(prev => ({
      ...prev,
      markupPercentage: markupValue,
      customerPrice: prev.retailPrice > 0 ? prev.retailPrice * (1 + markupValue / 100) : 0
    }));
  };

  const handleCustomerPriceChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      customerPrice: numericValue
    }));
  };

  const handleSubmit = () => {
    if (!formData.partName || formData.supplierCost <= 0 || formData.quantity <= 0) {
      return;
    }

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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Pricing Information</h4>
            <div className="flex items-center space-x-2">
              <Label htmlFor="useMarkupScale" className="text-sm">Use Markup Scale</Label>
              <Switch
                id="useMarkupScale"
                checked={useMarkupScale}
                onCheckedChange={setUseMarkupScale}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost *</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="retailPrice">Retail/List Price</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice}
                onChange={(e) => handleCustomerPriceChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Markup Information Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Original Markup %</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {originalMarkupPercentage.toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500">
                  (Supplier Cost → Retail Price)
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Current Markup %</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {currentMarkupPercentage.toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500">
                  (Retail Price → Customer Price)
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Markup Scale */}
          {useMarkupScale && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="markupSlider">Markup Percentage</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10000"
                    value={formData.markupPercentage}
                    onChange={(e) => handleInputChange('markupPercentage', e.target.value)}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Slider
                  id="markupSlider"
                  min={0}
                  max={1000}
                  step={1}
                  value={[Math.min(formData.markupPercentage, 1000)]}
                  onValueChange={handleMarkupSliderChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>500%</span>
                  <span>1000%+</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600">
                Note: You can enter values above 1000% in the input field above
              </div>
            </div>
          )}
        </div>

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

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter any additional notes"
            className="h-20"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={!formData.partName || formData.supplierCost <= 0 || formData.quantity <= 0}
        >
          Add Part
        </Button>
      </CardContent>
    </Card>
  );
}
