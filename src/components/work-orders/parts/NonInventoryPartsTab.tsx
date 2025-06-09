
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierCost, setSupplierCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [customerPrice, setCustomerPrice] = useState(0);
  const [markupPercentage, setMarkupPercentage] = useState(25);
  const [quantity, setQuantity] = useState(1);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poLine, setPoLine] = useState('');
  const [notes, setNotes] = useState('');
  const [useMarkupScale, setUseMarkupScale] = useState(false);

  // Calculate retail price from supplier cost and markup
  const calculateRetailPrice = (cost: number, markup: number) => {
    return cost * (1 + markup / 100);
  };

  // Calculate markup percentage from cost and retail price
  const calculateMarkupPercentage = (cost: number, retail: number) => {
    if (cost === 0) return 0;
    return ((retail - cost) / cost) * 100;
  };

  const handleSupplierCostChange = (value: string) => {
    const cost = parseFloat(value) || 0;
    setSupplierCost(cost);
    
    if (useMarkupScale) {
      const newRetailPrice = calculateRetailPrice(cost, markupPercentage);
      setRetailPrice(newRetailPrice);
      setCustomerPrice(newRetailPrice);
    }
  };

  const handleRetailPriceChange = (value: string) => {
    const retail = parseFloat(value) || 0;
    setRetailPrice(retail);
    
    if (supplierCost > 0) {
      const newMarkup = calculateMarkupPercentage(supplierCost, retail);
      setMarkupPercentage(newMarkup);
    }
    
    setCustomerPrice(retail);
  };

  const handleMarkupChange = (value: number[]) => {
    const markup = value[0];
    setMarkupPercentage(markup);
    
    if (useMarkupScale && supplierCost > 0) {
      const newRetailPrice = calculateRetailPrice(supplierCost, markup);
      setRetailPrice(newRetailPrice);
      setCustomerPrice(newRetailPrice);
    }
  };

  const handleMarkupScaleToggle = (enabled: boolean) => {
    setUseMarkupScale(enabled);
    
    if (enabled && supplierCost > 0) {
      const newRetailPrice = calculateRetailPrice(supplierCost, markupPercentage);
      setRetailPrice(newRetailPrice);
      setCustomerPrice(newRetailPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const part: WorkOrderPartFormValues = {
      partName,
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
      notes: notes || undefined
    };

    onAddPart(part);

    // Reset form
    setPartName('');
    setPartNumber('');
    setSupplierName('');
    setSupplierCost(0);
    setRetailPrice(0);
    setCustomerPrice(0);
    setMarkupPercentage(25);
    setQuantity(1);
    setInvoiceNumber('');
    setPoLine('');
    setNotes('');
    setUseMarkupScale(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Enter part name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={supplierName}
            onChange={setSupplierName}
            placeholder="Select or search supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost *</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            min="0"
            value={supplierCost}
            onChange={(e) => handleSupplierCostChange(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail/List Price *</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            min="0"
            value={retailPrice}
            onChange={(e) => handleRetailPriceChange(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="markupPercentage">Markup %</Label>
          <Input
            id="markupPercentage"
            type="number"
            step="0.1"
            min="0"
            value={markupPercentage.toFixed(1)}
            onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
            placeholder="25.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPrice">Customer Price *</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            min="0"
            value={customerPrice}
            onChange={(e) => setCustomerPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Sliding Markup Scale Toggle */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <Switch
          id="markupScale"
          checked={useMarkupScale}
          onCheckedChange={handleMarkupScaleToggle}
        />
        <div className="flex-1">
          <Label htmlFor="markupScale" className="text-sm font-medium">
            Use Sliding Markup Scale
          </Label>
          <p className="text-xs text-gray-600">
            Automatically calculate retail and customer prices based on markup percentage
          </p>
        </div>
      </div>

      {/* Markup Slider - Only show when toggle is enabled */}
      {useMarkupScale && (
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
          <Label htmlFor="markupSlider">
            Markup Percentage: {markupPercentage.toFixed(1)}%
          </Label>
          <Slider
            id="markupSlider"
            min={0}
            max={200}
            step={0.1}
            value={[markupPercentage]}
            onValueChange={handleMarkupChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
            <span>200%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poLine">PO Line</Label>
          <Input
            id="poLine"
            value={poLine}
            onChange={(e) => setPoLine(e.target.value)}
            placeholder="Enter PO line"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Non-Inventory Part
      </Button>
    </form>
  );
}
