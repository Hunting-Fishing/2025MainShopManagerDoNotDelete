import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { useToast } from '@/hooks/use-toast';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [partData, setPartData] = useState({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 0,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const [useMarkupScale, setUseMarkupScale] = useState(false);
  const { toast } = useToast();

  // Calculate markup percentage based on supplier cost and retail price
  const calculateDisplayMarkup = () => {
    if (partData.supplierCost > 0 && partData.retailPrice > 0) {
      return ((partData.retailPrice - partData.supplierCost) / partData.supplierCost) * 100;
    }
    return 0;
  };

  // Calculate customer price based on retail price and markup percentage
  const calculateCustomerPrice = () => {
    if (useMarkupScale && partData.retailPrice > 0) {
      return partData.retailPrice * (1 + partData.markupPercentage / 100);
    }
    return partData.retailPrice;
  };

  const handleInputChange = (field: string, value: string | number) => {
    const numericFields = ['supplierCost', 'retailPrice', 'quantity', 'markupPercentage'];
    const processedValue = numericFields.includes(field) ? Number(value) || 0 : value;
    
    setPartData(prev => {
      const updated = { ...prev, [field]: processedValue };
      
      // Auto-calculate markup percentage when both cost and retail are available
      if ((field === 'supplierCost' || field === 'retailPrice') && 
          updated.supplierCost > 0 && updated.retailPrice > 0) {
        updated.markupPercentage = ((updated.retailPrice - updated.supplierCost) / updated.supplierCost) * 100;
      }
      
      // Recalculate customer price
      if (useMarkupScale && updated.retailPrice > 0) {
        updated.customerPrice = updated.retailPrice * (1 + updated.markupPercentage / 100);
      } else {
        updated.customerPrice = updated.retailPrice;
      }
      
      return updated;
    });
  };

  const handleMarkupScaleToggle = () => {
    setUseMarkupScale(prev => {
      const newValue = !prev;
      
      setPartData(prevData => ({
        ...prevData,
        customerPrice: newValue && prevData.retailPrice > 0 
          ? prevData.retailPrice * (1 + prevData.markupPercentage / 100)
          : prevData.retailPrice
      }));
      
      return newValue;
    });
  };

  const handleAddPart = () => {
    if (!partData.partName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Part name is required"
      });
      return;
    }

    if (partData.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Quantity must be greater than 0"
      });
      return;
    }

    if (partData.customerPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer price must be greater than 0"
      });
      return;
    }

    const newPart: WorkOrderPartFormValues = {
      partName: partData.partName.trim(),
      partNumber: partData.partNumber.trim() || undefined,
      supplierName: partData.supplierName.trim() || undefined,
      supplierCost: partData.supplierCost,
      markupPercentage: partData.markupPercentage,
      retailPrice: partData.retailPrice,
      customerPrice: partData.customerPrice,
      quantity: partData.quantity,
      partType: 'non-inventory',
      invoiceNumber: partData.invoiceNumber.trim() || undefined,
      poLine: partData.poLine.trim() || undefined,
      notes: partData.notes.trim() || undefined
    };

    onAddPart(newPart);

    // Reset form
    setPartData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 0,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      invoiceNumber: '',
      poLine: '',
      notes: ''
    });

    toast({
      title: "Success",
      description: "Non-inventory part added successfully"
    });
  };

  return (
    <div className="space-y-4">
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
                value={partData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
              />
            </div>

            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={partData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>

            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={partData.supplierName}
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
                value={partData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={partData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="retailPrice">Retail/List Price ($) *</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={partData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useMarkupScale"
                checked={useMarkupScale}
                onChange={handleMarkupScaleToggle}
                className="rounded"
              />
              <Label htmlFor="useMarkupScale">Apply markup to customer price</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="markupPercentage">
                  Markup % {partData.supplierCost > 0 && partData.retailPrice > 0 ? '(Calculated)' : ''}
                </Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  step="0.01"
                  value={partData.markupPercentage.toFixed(2)}
                  onChange={(e) => handleInputChange('markupPercentage', e.target.value)}
                  disabled={!useMarkupScale}
                />
              </div>

              <div>
                <Label htmlFor="customerPrice">Customer Price ($)</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={partData.customerPrice.toFixed(2)}
                  onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                  disabled={useMarkupScale}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={partData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={partData.poLine}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Enter PO line"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={partData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <Button onClick={handleAddPart} className="w-full">
            Add Part
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
