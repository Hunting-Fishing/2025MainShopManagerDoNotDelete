import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus } from 'lucide-react';
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
    markupPercentage: 67.69,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    notes: ''
  });

  // Track markup components separately
  const [baseMarkupPercentage, setBaseMarkupPercentage] = useState(67.69); // Supplier to Retail
  const [userAdjustmentMarkup, setUserAdjustmentMarkup] = useState(0); // Additional markup from Retail to Customer
  const [effectiveMarkupPercentage, setEffectiveMarkupPercentage] = useState(67.69); // Total markup shown

  // Calculate retail price from supplier cost and base markup
  const calculateRetailPrice = (supplierCost: number, baseMarkup: number): number => {
    return supplierCost * (1 + baseMarkup / 100);
  };

  // Calculate customer price from retail price and user adjustment
  const calculateCustomerPrice = (retailPrice: number, userMarkup: number): number => {
    return retailPrice * (1 + userMarkup / 100);
  };

  // Calculate effective markup from supplier cost to customer price
  const calculateEffectiveMarkup = (supplierCost: number, customerPrice: number): number => {
    if (supplierCost === 0) return 0;
    return ((customerPrice - supplierCost) / supplierCost) * 100;
  };

  // Calculate user adjustment markup from retail to customer price
  const calculateUserAdjustmentMarkup = (retailPrice: number, customerPrice: number): number => {
    if (retailPrice === 0) return 0;
    return ((customerPrice - retailPrice) / retailPrice) * 100;
  };

  // Update all calculated fields when supplier cost or base markup changes
  useEffect(() => {
    const newRetailPrice = calculateRetailPrice(formData.supplierCost, baseMarkupPercentage);
    const newCustomerPrice = calculateCustomerPrice(newRetailPrice, userAdjustmentMarkup);
    const newEffectiveMarkup = calculateEffectiveMarkup(formData.supplierCost, newCustomerPrice);
    
    setFormData(prev => ({
      ...prev,
      retailPrice: newRetailPrice,
      customerPrice: newCustomerPrice,
      markupPercentage: newEffectiveMarkup
    }));
    
    setEffectiveMarkupPercentage(newEffectiveMarkup);
  }, [formData.supplierCost, baseMarkupPercentage, userAdjustmentMarkup]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    if (field === 'supplierCost') {
      const supplierCost = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setFormData(prev => ({ ...prev, [field]: supplierCost }));
    } else if (field === 'retailPrice') {
      const retailPrice = typeof value === 'string' ? parseFloat(value) || 0 : value;
      // When retail price is manually changed, recalculate base markup
      if (formData.supplierCost > 0) {
        const newBaseMarkup = ((retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
        setBaseMarkupPercentage(newBaseMarkup);
      }
      
      // Keep customer price in sync with user adjustment
      const newCustomerPrice = calculateCustomerPrice(retailPrice, userAdjustmentMarkup);
      const newEffectiveMarkup = calculateEffectiveMarkup(formData.supplierCost, newCustomerPrice);
      
      setFormData(prev => ({
        ...prev,
        retailPrice,
        customerPrice: newCustomerPrice,
        markupPercentage: newEffectiveMarkup
      }));
      setEffectiveMarkupPercentage(newEffectiveMarkup);
    } else if (field === 'customerPrice') {
      const customerPrice = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // When customer price is manually changed, recalculate user adjustment markup
      const newUserAdjustment = calculateUserAdjustmentMarkup(formData.retailPrice, customerPrice);
      const newEffectiveMarkup = calculateEffectiveMarkup(formData.supplierCost, customerPrice);
      
      setUserAdjustmentMarkup(newUserAdjustment);
      setEffectiveMarkupPercentage(newEffectiveMarkup);
      
      setFormData(prev => ({
        ...prev,
        customerPrice,
        markupPercentage: newEffectiveMarkup
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBaseMarkupChange = (value: number[]) => {
    const newBaseMarkup = value[0];
    setBaseMarkupPercentage(newBaseMarkup);
  };

  const handleUserAdjustmentChange = (value: number[]) => {
    const newUserAdjustment = value[0];
    setUserAdjustmentMarkup(newUserAdjustment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      markupPercentage: 67.69,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      notes: ''
    });
    setBaseMarkupPercentage(67.69);
    setUserAdjustmentMarkup(0);
    setEffectiveMarkupPercentage(67.69);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
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

          <div>
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
              />
            </div>
            
            <div>
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

          {/* Enhanced Markup Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium">Pricing & Markup</h4>
            
            {/* Base Markup (Supplier to Retail) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Base Markup % (Supplier → Retail)</Label>
                <span className="text-sm font-medium">{baseMarkupPercentage.toFixed(2)}%</span>
              </div>
              <Slider
                value={[baseMarkupPercentage]}
                onValueChange={handleBaseMarkupChange}
                max={200}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retailPrice">Retail/List Price</Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retailPrice.toFixed(2)}
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
                  value={formData.customerPrice.toFixed(2)}
                  onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* User Adjustment Markup (Retail to Customer) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>User Adjustment % (Retail → Customer)</Label>
                <span className="text-sm font-medium">{userAdjustmentMarkup.toFixed(2)}%</span>
              </div>
              <Slider
                value={[userAdjustmentMarkup]}
                onValueChange={handleUserAdjustmentChange}
                max={100}
                min={-50}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Effective Total Markup */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <Label className="font-medium">Effective Total Markup %</Label>
                <span className="text-lg font-bold text-green-600">{effectiveMarkupPercentage.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total markup from supplier cost to customer price
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
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
