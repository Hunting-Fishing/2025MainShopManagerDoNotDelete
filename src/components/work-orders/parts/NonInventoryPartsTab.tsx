
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Plus } from 'lucide-react';

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
    supplierCost: '',
    markupPercentage: '',
    retailPrice: '',
    customerPrice: '',
    quantity: '',
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [useMarkupScale, setUseMarkupScale] = useState(false);

  // Calculate values
  const supplierCost = parseFloat(formData.supplierCost) || 0;
  const retailPrice = parseFloat(formData.retailPrice) || 0;
  const customerPrice = parseFloat(formData.customerPrice) || 0;
  const markupPercentage = parseFloat(formData.markupPercentage) || 0;
  const quantity = parseFloat(formData.quantity) || 0;

  // Original markup (Supplier Cost vs Retail Price)
  const originalMarkupPercentage = supplierCost > 0 ? ((retailPrice - supplierCost) / supplierCost) * 100 : 0;

  // Current markup (Retail Price vs Customer Price) 
  const currentMarkupPercentage = retailPrice > 0 ? ((customerPrice - retailPrice) / retailPrice) * 100 : 0;

  const totalValue = customerPrice * quantity;

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-populate customer price with retail price when retail price is entered and customer price is empty
      if (field === 'retailPrice' && value && (!prev.customerPrice || prev.customerPrice === '0' || prev.customerPrice === '')) {
        updated.customerPrice = value;
      }
      
      // If using markup scale and supplier cost or markup percentage changes, recalculate retail and customer price
      if (useMarkupScale && (field === 'supplierCost' || field === 'markupPercentage')) {
        const newSupplierCost = parseFloat(field === 'supplierCost' ? value : updated.supplierCost) || 0;
        const newMarkupPercentage = parseFloat(field === 'markupPercentage' ? value : updated.markupPercentage) || 0;
        
        if (newSupplierCost > 0 && newMarkupPercentage >= 0) {
          const calculatedRetailPrice = newSupplierCost * (1 + newMarkupPercentage / 100);
          updated.retailPrice = calculatedRetailPrice.toFixed(2);
          updated.customerPrice = calculatedRetailPrice.toFixed(2);
        }
      }
      
      return updated;
    });
  };

  const handleSliderChange = (value: number[]) => {
    const newMarkup = value[0];
    setFormData(prev => {
      const newSupplierCost = parseFloat(prev.supplierCost) || 0;
      
      if (newSupplierCost > 0) {
        const calculatedRetailPrice = newSupplierCost * (1 + newMarkup / 100);
        return {
          ...prev,
          markupPercentage: newMarkup.toString(),
          retailPrice: calculatedRetailPrice.toFixed(2),
          customerPrice: calculatedRetailPrice.toFixed(2)
        };
      }
      
      return {
        ...prev,
        markupPercentage: newMarkup.toString()
      };
    });
  };

  const handleCustomerPriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, customerPrice: value }));
  };

  const handleSubmit = () => {
    if (!formData.partName.trim()) {
      alert('Part name is required');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      ...formData,
      supplierCost: parseFloat(formData.supplierCost) || 0,
      markupPercentage: parseFloat(formData.markupPercentage) || 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      customerPrice: parseFloat(formData.customerPrice) || 0,
      quantity: parseFloat(formData.quantity) || 1
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: '',
      markupPercentage: '',
      retailPrice: '',
      customerPrice: '',
      quantity: '',
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

        <div className="space-y-2">
          <Label htmlFor="supplierName">Supplier Name</Label>
          <Input
            id="supplierName"
            value={formData.supplierName}
            onChange={(e) => handleInputChange('supplierName', e.target.value)}
            placeholder="Enter supplier name"
          />
        </div>

        <Separator />

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Pricing Information</h4>
            <div className="flex items-center space-x-2">
              <Label htmlFor="useMarkupScale" className="text-xs">Use Markup Scale</Label>
              <input
                id="useMarkupScale"
                type="checkbox"
                checked={useMarkupScale}
                onChange={(e) => setUseMarkupScale(e.target.checked)}
                className="rounded border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail/List Price ($)</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                disabled={useMarkupScale}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price ($)</Label>
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

          {/* Markup Section */}
          {useMarkupScale && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Markup Percentage</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.markupPercentage}
                    onChange={(e) => handleInputChange('markupPercentage', e.target.value)}
                    className="w-20 text-xs"
                    placeholder="0"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Slider
                  value={[markupPercentage]}
                  onValueChange={handleSliderChange}
                  max={1000}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>500%</span>
                  <span>1000%+</span>
                </div>
              </div>
            </div>
          )}

          {/* Markup Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-600">Original Markup %</div>
              <div className="text-sm font-medium text-blue-600">
                {originalMarkupPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">(Cost vs Retail)</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Current Markup %</div>
              <div className="text-sm font-medium text-green-600">
                {currentMarkupPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">(Retail vs Customer)</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quantity and Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter any additional notes"
            rows={3}
          />
        </div>

        {/* Summary */}
        {quantity > 0 && customerPrice > 0 && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Value:</span>
              <Badge variant="secondary" className="text-lg">
                ${totalValue.toFixed(2)}
              </Badge>
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </CardContent>
    </Card>
  );
}
