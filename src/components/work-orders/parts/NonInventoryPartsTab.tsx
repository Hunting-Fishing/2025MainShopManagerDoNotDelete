
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Package, Plus } from 'lucide-react';
import { WorkOrderPartFormValues, PART_TYPES } from '@/types/workOrderPart';
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

  // Helper functions to safely convert between string and number for display
  const getDisplayValue = (value: number): string => {
    return value === 0 ? '' : value.toString();
  };

  const getNumericValue = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field === 'supplierCost' && typeof value === 'string') {
        const numericValue = getNumericValue(value);
        newData.supplierCost = numericValue;
        
        // Auto-calculate retail price if markup percentage exists
        if (newData.markupPercentage > 0) {
          newData.retailPrice = numericValue * (1 + newData.markupPercentage / 100);
        }
        
        // Auto-populate customer price with retail price if customer price is empty/zero
        if ((newData.customerPrice === 0 || newData.customerPrice === 0) && newData.retailPrice > 0) {
          newData.customerPrice = newData.retailPrice;
        }
      } else if (field === 'markupPercentage' && typeof value === 'number') {
        newData.markupPercentage = value;
        
        // Recalculate retail price
        if (newData.supplierCost > 0) {
          newData.retailPrice = newData.supplierCost * (1 + value / 100);
          
          // Auto-populate customer price with retail price if customer price is empty/zero
          if (newData.customerPrice === 0) {
            newData.customerPrice = newData.retailPrice;
          }
        }
      } else if (field === 'retailPrice' && typeof value === 'string') {
        const numericValue = getNumericValue(value);
        newData.retailPrice = numericValue;
        
        // Auto-populate customer price with retail price if customer price is empty/zero
        if ((newData.customerPrice === 0 || newData.customerPrice === 0) && numericValue > 0) {
          newData.customerPrice = numericValue;
        }
      } else if (field === 'customerPrice' && typeof value === 'string') {
        newData.customerPrice = getNumericValue(value);
      } else if (field === 'quantity' && typeof value === 'string') {
        newData.quantity = getNumericValue(value);
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  const handleMarkupChange = (values: number[]) => {
    const markup = values[0];
    handleInputChange('markupPercentage', markup);
  };

  const handleManualMarkupChange = (value: string) => {
    const numericValue = getNumericValue(value);
    handleInputChange('markupPercentage', numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      alert('Please enter a part name');
      return;
    }
    
    if (formData.supplierCost <= 0) {
      alert('Please enter a valid supplier cost');
      return;
    }
    
    onAddPart({
      ...formData,
      supplierCost: formData.supplierCost,
      markupPercentage: formData.markupPercentage,
      retailPrice: formData.retailPrice,
      customerPrice: formData.customerPrice,
      quantity: formData.quantity
    });
    
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

  // Calculate markups for display
  const originalMarkup = formData.supplierCost > 0 
    ? ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100 
    : 0;
  
  const currentMarkup = formData.retailPrice > 0 
    ? ((formData.customerPrice - formData.retailPrice) / formData.retailPrice) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Add Non-Inventory Part
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <SupplierSelector
            value={formData.supplierName || ''}
            onChange={(value) => handleInputChange('supplierName', value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost *</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="0.01"
                value={getDisplayValue(formData.supplierCost)}
                onChange={(e) => handleInputChange('supplierCost', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={getDisplayValue(formData.quantity)}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="1"
                required
              />
            </div>
          </div>

          {/* Markup Percentage Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Markup Percentage</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Original:</span>
                <span className="text-sm font-medium text-blue-600">
                  {originalMarkup.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="text-sm font-medium text-green-600">
                  {currentMarkup.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Slider
                value={[Math.min(formData.markupPercentage, 1000)]}
                onValueChange={handleMarkupChange}
                max={1000}
                step={1}
                className="w-full"
              />
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={getDisplayValue(formData.markupPercentage)}
                  onChange={(e) => handleManualMarkupChange(e.target.value)}
                  className="w-24"
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">%</span>
                {formData.markupPercentage > 1000 && (
                  <span className="text-xs text-amber-600">High markup detected</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retailPrice">Retail/List Price</Label>
              <Input
                id="retailPrice"
                type="number"
                min="0"
                step="0.01"
                value={getDisplayValue(formData.retailPrice)}
                onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="customerPrice">Customer Price *</Label>
              <Input
                id="customerPrice"
                type="number"
                min="0"
                step="0.01"
                value={getDisplayValue(formData.customerPrice)}
                onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

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
              placeholder="Additional notes about this part"
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
