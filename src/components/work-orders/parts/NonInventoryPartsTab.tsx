
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RotateCcw } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Omit<WorkOrderPartFormValues, 'partType'>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 30, // Default 30% markup
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [isCustomerPriceManual, setIsCustomerPriceManual] = useState(false);

  // Calculate retail price from supplier cost and markup
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage >= 0) {
      const newRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: newRetailPrice
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  // Update customer price to match retail price (unless manually adjusted)
  useEffect(() => {
    if (!isCustomerPriceManual && formData.retailPrice > 0) {
      setFormData(prev => ({
        ...prev,
        customerPrice: formData.retailPrice
      }));
    }
  }, [formData.retailPrice, isCustomerPriceManual]);

  // Calculate markup percentage when retail price is manually changed
  const handleRetailPriceChange = (value: string) => {
    const retailPrice = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      retailPrice
    }));
    
    // Recalculate markup percentage if supplier cost exists
    if (formData.supplierCost > 0) {
      const newMarkupPercentage = ((retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({
        ...prev,
        markupPercentage: Math.max(0, newMarkupPercentage)
      }));
    }
  };

  const handleCustomerPriceChange = (value: string) => {
    const customerPrice = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      customerPrice
    }));
    setIsCustomerPriceManual(true);
  };

  const resetCustomerPriceToRetail = () => {
    setFormData(prev => ({
      ...prev,
      customerPrice: prev.retailPrice
    }));
    setIsCustomerPriceManual(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      alert('Part name is required');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      ...formData,
      partType: 'non-inventory',
      inventoryItemId: undefined
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 30,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      invoiceNumber: '',
      poLine: '',
      notes: ''
    });
    setIsCustomerPriceManual(false);
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
                onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
                placeholder="Enter part name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                min="0"
                value={formData.markupPercentage.toFixed(1)}
                onChange={(e) => setFormData(prev => ({ ...prev, markupPercentage: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="retailPrice">Retail/List Price</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice.toFixed(2)}
                onChange={(e) => handleRetailPriceChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="customerPrice">Customer Price</Label>
              {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetCustomerPriceToRetail}
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to Retail
                </Button>
              )}
            </div>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice.toFixed(2)}
              onChange={(e) => handleCustomerPriceChange(e.target.value)}
              placeholder="0.00"
              className={isCustomerPriceManual && formData.customerPrice !== formData.retailPrice ? 'border-amber-300 bg-amber-50' : ''}
            />
            {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
              <p className="text-xs text-amber-600 mt-1">
                Manually adjusted from retail price (${formData.retailPrice.toFixed(2)})
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="Enter invoice number"
              />
            </div>
            
            <div>
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={formData.poLine}
                onChange={(e) => setFormData(prev => ({ ...prev, poLine: e.target.value }))}
                placeholder="Enter PO line"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Part
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
