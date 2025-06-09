
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

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
  const [markupPercentage, setMarkupPercentage] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const retailPrice = supplierCost * (1 + (markupPercentage / 100));
  const [customerPrice, setCustomerPrice] = useState(retailPrice);

  // Calculate effective markup based on customer price vs supplier cost
  const effectiveMarkup = supplierCost > 0 ? ((customerPrice - supplierCost) / supplierCost) * 100 : 0;

  const handleSupplierCostChange = (newCost: number) => {
    setSupplierCost(newCost);
    const newRetailPrice = newCost * (1 + (markupPercentage / 100));
    setCustomerPrice(newRetailPrice);
  };

  const handleMarkupChange = (newMarkup: number) => {
    setMarkupPercentage(newMarkup);
    const newRetailPrice = supplierCost * (1 + (newMarkup / 100));
    setCustomerPrice(newRetailPrice);
  };

  const handleCustomerPriceChange = (newPrice: number) => {
    setCustomerPrice(newPrice);
    // Update markup percentage based on new customer price
    if (supplierCost > 0) {
      const newMarkup = ((newPrice - supplierCost) / supplierCost) * 100;
      setMarkupPercentage(Math.max(0, newMarkup));
    }
  };

  // Sync retail price with customer price for display
  React.useEffect(() => {
    setCustomerPrice(retailPrice);
  }, [retailPrice]);

  const handleAddPart = () => {
    const newPart: WorkOrderPartFormValues = {
      partName,
      partNumber,
      supplierName,
      supplierCost,
      markupPercentage: effectiveMarkup, // Use effective markup
      retailPrice,
      customerPrice,
      quantity,
      partType: 'non-inventory',
      notes,
    };

    onAddPart(newPart);
    // Reset form fields
    setPartName('');
    setPartNumber('');
    setSupplierName('');
    setSupplierCost(0);
    setMarkupPercentage(50);
    setCustomerPrice(0);
    setQuantity(1);
    setNotes('');
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="partName">Part Name</Label>
        <Input
          type="text"
          id="partName"
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="partNumber">Part Number</Label>
        <Input
          type="text"
          id="partNumber"
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="supplierName">Supplier Name</Label>
        <Input
          type="text"
          id="supplierName"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="supplierCost">Supplier Cost</Label>
        <Input
          type="number"
          id="supplierCost"
          value={supplierCost}
          onChange={(e) => handleSupplierCostChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="markupPercentage">Markup Percentage ({effectiveMarkup.toFixed(2)}%)</Label>
        <Slider
          id="markupPercentage"
          value={[markupPercentage]}
          min={0}
          max={200}
          step={1}
          onValueChange={(value) => handleMarkupChange(value[0])}
        />
      </div>
      <div>
        <Label htmlFor="customerPrice">Customer Price</Label>
        <Input
          type="number"
          id="customerPrice"
          value={customerPrice}
          onChange={(e) => handleCustomerPriceChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button onClick={handleAddPart}>Add Part</Button>
    </div>
  );
}
