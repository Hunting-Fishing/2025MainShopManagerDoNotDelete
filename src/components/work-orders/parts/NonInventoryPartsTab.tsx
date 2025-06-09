
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from '@/components/work-orders/parts/SupplierSelector';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierCost, setSupplierCost] = useState<number>(0);
  const [useMarkupSlider, setUseMarkupSlider] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState<number>(25);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [customerPrice, setCustomerPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poLine, setPoLine] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate retail price based on supplier cost and markup
  const calculateRetailPrice = (cost: number, markup: number) => {
    return cost * (1 + markup / 100);
  };

  // Update retail price when supplier cost or markup changes (only if using slider)
  React.useEffect(() => {
    if (useMarkupSlider && supplierCost > 0) {
      const calculated = calculateRetailPrice(supplierCost, markupPercentage);
      setRetailPrice(calculated);
    }
  }, [supplierCost, markupPercentage, useMarkupSlider]);

  // Update customer price when retail price changes
  React.useEffect(() => {
    setCustomerPrice(retailPrice);
  }, [retailPrice]);

  const handleSubmit = () => {
    if (!partName.trim()) {
      return;
    }

    const newPart: WorkOrderPartFormValues = {
      partName: partName.trim(),
      partNumber: partNumber || undefined,
      supplierName: supplierName || undefined,
      supplierCost,
      markupPercentage,
      retailPrice,
      customerPrice,
      quantity,
      partType: 'non-inventory',
      invoiceNumber: invoiceNumber || undefined,
      poLine: poLine || undefined,
      notes: notes || undefined,
    };

    onAddPart(newPart);

    // Reset form
    setPartName('');
    setPartNumber('');
    setSupplierName('');
    setSupplierCost(0);
    setMarkupPercentage(25);
    setRetailPrice(0);
    setCustomerPrice(0);
    setQuantity(1);
    setInvoiceNumber('');
    setPoLine('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Part Name */}
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Enter part name"
          />
        </div>

        {/* Part Number */}
        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        {/* Supplier with Search */}
        <div className="space-y-2">
          <Label>Supplier</Label>
          <SupplierSelector
            value={supplierName}
            onChange={setSupplierName}
            placeholder="Search and select supplier..."
          />
        </div>

        {/* Supplier Cost */}
        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            min="0"
            value={supplierCost}
            onChange={(e) => setSupplierCost(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        {/* Markup Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="useMarkupSlider"
              checked={useMarkupSlider}
              onCheckedChange={setUseMarkupSlider}
            />
            <Label htmlFor="useMarkupSlider">Use Sliding Markup Scale</Label>
          </div>

          {useMarkupSlider && (
            <div className="space-y-2">
              <Label htmlFor="markupPercentage">Markup Percentage: {markupPercentage}%</Label>
              <input
                id="markupPercentage"
                type="range"
                min="0"
                max="200"
                step="5"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
                <span>200%</span>
              </div>
            </div>
          )}

          {!useMarkupSlider && (
            <div className="space-y-2">
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                min="0"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                placeholder="25"
              />
            </div>
          )}
        </div>

        {/* Retail/List Price */}
        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail/List Price</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            min="0"
            value={retailPrice}
            onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={useMarkupSlider}
          />
          {useMarkupSlider && (
            <p className="text-xs text-gray-500">Automatically calculated from supplier cost and markup</p>
          )}
        </div>

        {/* Customer Price */}
        <div className="space-y-2">
          <Label htmlFor="customerPrice">Customer Price</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            min="0"
            value={customerPrice}
            onChange={(e) => setCustomerPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>

        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>

        {/* PO Line */}
        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            value={poLine}
            onChange={(e) => setPoLine(e.target.value)}
            placeholder="Enter PO line"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes"
          />
        </div>

        {/* Add Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!partName.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Non-Inventory Part
        </Button>
      </CardContent>
    </Card>
  );
}
