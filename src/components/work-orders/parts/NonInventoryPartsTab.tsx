
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onAddPart: (part: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePart: (partId: string, updates: Partial<WorkOrderPart>) => void;
  onDeletePart: (partId: string) => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  parts,
  onAddPart,
  onUpdatePart,
  onDeletePart
}: NonInventoryPartsTabProps) {
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
    notes: ''
  });

  // Enhanced calculation logic that tracks effective markup
  const calculatePricing = (
    cost: number,
    retail: number,
    customer: number,
    markup: number,
    source: 'cost' | 'retail' | 'customer' | 'markup' | 'slider'
  ) => {
    let newCost = cost;
    let newRetail = retail;
    let newCustomer = customer;
    let newMarkup = markup;

    switch (source) {
      case 'cost':
        // When cost changes, recalculate based on current markup
        if (newCost > 0 && markup > 0) {
          newCustomer = newCost * (1 + markup / 100);
          newRetail = newCustomer; // Keep retail in sync initially
        }
        break;
        
      case 'retail':
        // When retail changes, calculate base markup and set customer price
        if (newCost > 0 && retail > 0) {
          newMarkup = ((retail - newCost) / newCost) * 100;
          newCustomer = retail; // Auto-populate customer with retail
        }
        break;
        
      case 'customer':
        // When customer price changes manually, calculate effective markup
        if (newCost > 0 && customer > 0) {
          newMarkup = ((customer - newCost) / newCost) * 100;
        }
        break;
        
      case 'markup':
        // When markup is manually entered, calculate customer price
        if (newCost > 0) {
          newCustomer = newCost * (1 + markup / 100);
          // Only update retail if it's not set or if we're starting fresh
          if (retail === 0) {
            newRetail = newCustomer;
          }
        }
        break;
        
      case 'slider':
        // When slider changes, it adjusts from current customer price
        if (newCost > 0) {
          newCustomer = newCost * (1 + markup / 100);
        }
        break;
    }

    return {
      supplierCost: Number(newCost.toFixed(2)),
      markupPercentage: Number(newMarkup.toFixed(2)),
      retailPrice: Number(newRetail.toFixed(2)),
      customerPrice: Number(newCustomer.toFixed(2))
    };
  };

  const handleFieldChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    const currentValues = {
      cost: formData.supplierCost,
      retail: formData.retailPrice,
      customer: formData.customerPrice,
      markup: formData.markupPercentage
    };

    let source: 'cost' | 'retail' | 'customer' | 'markup' | 'slider' = 'cost';
    let newValues = currentValues;

    switch (field) {
      case 'supplierCost':
        newValues = { ...currentValues, cost: Number(value) || 0 };
        source = 'cost';
        break;
      case 'retailPrice':
        newValues = { ...currentValues, retail: Number(value) || 0 };
        source = 'retail';
        break;
      case 'customerPrice':
        newValues = { ...currentValues, customer: Number(value) || 0 };
        source = 'customer';
        break;
      case 'markupPercentage':
        newValues = { ...currentValues, markup: Number(value) || 0 };
        source = 'markup';
        break;
      default:
        // For non-pricing fields, just update directly
        setFormData(prev => ({ ...prev, [field]: value }));
        return;
    }

    const calculated = calculatePricing(
      newValues.cost,
      newValues.retail,
      newValues.customer,
      newValues.markup,
      source
    );

    setFormData(prev => ({
      ...prev,
      supplierCost: calculated.supplierCost,
      markupPercentage: calculated.markupPercentage,
      retailPrice: calculated.retailPrice,
      customerPrice: calculated.customerPrice
    }));
  };

  const handleSliderChange = (value: number[]) => {
    const newMarkup = value[0];
    const calculated = calculatePricing(
      formData.supplierCost,
      formData.retailPrice,
      formData.customerPrice,
      newMarkup,
      'slider'
    );

    setFormData(prev => ({
      ...prev,
      markupPercentage: calculated.markupPercentage,
      customerPrice: calculated.customerPrice
    }));
  };

  const handleAddPart = () => {
    if (!formData.partName.trim()) return;

    const newPart: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      partName: formData.partName,
      partNumber: formData.partNumber,
      supplierName: formData.supplierName,
      supplierCost: formData.supplierCost,
      markupPercentage: formData.markupPercentage,
      retailPrice: formData.retailPrice,
      customerPrice: formData.customerPrice,
      quantity: formData.quantity,
      partType: 'non-inventory',
      notes: formData.notes
    };

    onAddPart(newPart);

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
      notes: ''
    });
  };

  const sliderMax = formData.markupPercentage > 1000 ? 10000 : 1000;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Non-Inventory Part
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleFieldChange('partName', e.target.value)}
                placeholder="Enter part name"
              />
            </div>

            <div>
              <Label htmlFor="partNumber">Part Number (Optional)</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleFieldChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <SupplierSelector
                value={formData.supplierName}
                onChange={(value) => handleFieldChange('supplierName', value)}
                placeholder="Select supplier"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleFieldChange('supplierCost', e.target.value)}
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
                onChange={(e) => handleFieldChange('retailPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                min="0"
                max="10000"
                value={formData.markupPercentage}
                onChange={(e) => handleFieldChange('markupPercentage', e.target.value)}
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
                onChange={(e) => handleFieldChange('customerPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Markup Slider */}
          <div className="space-y-2">
            <Label>Markup Adjustment Slider: {formData.markupPercentage.toFixed(2)}%</Label>
            <Slider
              value={[formData.markupPercentage]}
              onValueChange={handleSliderChange}
              max={sliderMax}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{sliderMax === 10000 ? '10,000%' : '1,000%'}</span>
            </div>
            {sliderMax === 1000 && formData.markupPercentage > 950 && (
              <p className="text-xs text-muted-foreground">
                Slider automatically extends to 10,000% for high markup values
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Additional notes about this part"
            />
          </div>

          <Button onClick={handleAddPart} className="w-full">
            Add Part
          </Button>
        </CardContent>
      </Card>

      {/* Parts List */}
      {parts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Non-Inventory Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{part.partName}</div>
                    {part.partNumber && (
                      <div className="text-sm text-muted-foreground">Part #: {part.partNumber}</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Supplier: {part.supplierName || 'N/A'} | Qty: {part.quantity}
                    </div>
                    <div className="text-sm">
                      Cost: ${part.supplierCost.toFixed(2)} | 
                      Markup: {part.markupPercentage.toFixed(2)}% | 
                      Customer: ${part.customerPrice.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeletePart(part.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
