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
  const customerPrice = retailPrice;

  const handleAddPart = () => {
    const newPart: WorkOrderPartFormValues = {
      partName,
      partNumber,
      supplierName,
      supplierCost,
      markupPercentage,
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
          onChange={(e) => setSupplierCost(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="markupPercentage">Markup Percentage ({markupPercentage}%)</Label>
        <Slider
          id="markupPercentage"
          defaultValue={[markupPercentage]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setMarkupPercentage(value[0])}
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
