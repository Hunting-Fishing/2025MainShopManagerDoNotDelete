import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';
interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}
export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 50,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    notes: ''
  });

  // Auto-calculate prices and markup based on input changes
  useEffect(() => {
    const {
      supplierCost,
      markupPercentage,
      retailPrice
    } = formData;
    if (supplierCost > 0) {
      // Calculate retail price from supplier cost + markup
      const calculatedRetailPrice = supplierCost * (1 + markupPercentage / 100);

      // If retail price was manually entered and differs significantly from calculated,
      // auto-calculate markup percentage instead
      if (retailPrice > 0 && Math.abs(retailPrice - calculatedRetailPrice) > 0.01) {
        const calculatedMarkup = (retailPrice - supplierCost) / supplierCost * 100;
        setFormData(prev => ({
          ...prev,
          markupPercentage: Math.max(0, Math.round(calculatedMarkup * 100) / 100),
          customerPrice: retailPrice // Customer price follows retail/list price
        }));
      } else {
        // Normal calculation: supplier cost + markup → retail & customer price
        setFormData(prev => ({
          ...prev,
          retailPrice: Math.round(calculatedRetailPrice * 100) / 100,
          customerPrice: Math.round(calculatedRetailPrice * 100) / 100
        }));
      }
    }
  }, [formData.supplierCost, formData.markupPercentage, formData.retailPrice]);
  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSliderChange = (value: number[]) => {
    const newMarkup = value[0];
    setFormData(prev => ({
      ...prev,
      markupPercentage: newMarkup
    }));
  };
  const handleAddPart = () => {
    if (!formData.partName.trim()) {
      return;
    }
    onAddPart({
      ...formData,
      partName: formData.partName.trim(),
      partNumber: formData.partNumber?.trim() || '',
      supplierName: formData.supplierName?.trim() || '',
      notes: formData.notes?.trim() || ''
    });

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
      partType: 'non-inventory',
      notes: ''
    });
  };
  const totalPrice = formData.quantity * formData.customerPrice;
  return <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Part Information */}
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name *</Label>
            <Input id="partName" value={formData.partName} onChange={e => handleInputChange('partName', e.target.value)} placeholder="Enter part name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input id="partNumber" value={formData.partNumber || ''} onChange={e => handleInputChange('partNumber', e.target.value)} placeholder="Enter part number" />
          </div>

          {/* Supplier Information */}
          <div className="space-y-2">
            <Label>Supplier</Label>
            <SupplierSelector value={formData.supplierName || ''} onChange={value => handleInputChange('supplierName', value)} placeholder="Select or add supplier" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 1)} />
          </div>

          {/* Pricing Section */}
          <div className="space-y-2">
            <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
            <Input id="supplierCost" type="number" step="0.01" min="0" value={formData.supplierCost || ''} onChange={e => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)} placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail/List Price ($)</Label>
            <Input id="retailPrice" type="number" step="0.01" min="0" value={formData.retailPrice || ''} onChange={e => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
          </div>

          {/* Markup Percentage Input */}
          <div className="space-y-2">
            <Label htmlFor="markupPercentage">Markup % (Auto-calculated)</Label>
            <Input id="markupPercentage" type="number" step="0.01" min="0" max="10000" value={formData.markupPercentage || ''} onChange={e => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)} placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price ($)</Label>
            <Input id="customerPrice" type="number" step="0.01" min="0" value={formData.customerPrice || ''} onChange={e => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
          </div>

          {/* Markup Slider - Full Width */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2 bg-green-400">
              <Label>Markup Adjustment Slider: {formData.markupPercentage.toFixed(2)}%</Label>
              <div className="px-2">
                <Slider value={[formData.markupPercentage]} onValueChange={handleSliderChange} min={0} max={1000} step={0.1} className="w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>500%</span>
                <span>1000%</span>
              </div>
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => setFormData(prev => ({
                ...prev,
                markupPercentage: 10000
              }))} className="text-xs">
                  Set Max (10,000%)
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Additional notes about this part" rows={3} />
          </div>

          {/* Price Summary */}
          <div className="md:col-span-2">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formData.quantity} × ${formData.customerPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="md:col-span-2">
            <Button onClick={handleAddPart} disabled={!formData.partName.trim()} className="w-full">
              Add Non-Inventory Part
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}