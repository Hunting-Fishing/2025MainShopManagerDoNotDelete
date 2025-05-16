
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { DatePicker } from '@/components/ui/date-picker';

interface SpecialOrderItemFormProps {
  onSave: (item: Partial<WorkOrderInventoryItem>) => void;
  onCancel: () => void;
}

export function SpecialOrderItemForm({ onSave, onCancel }: SpecialOrderItemFormProps) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Parts');
  const [sku, setSku] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState<Date | undefined>();
  const [supplierName, setSupplierName] = useState('');
  const [supplierOrderRef, setSupplierOrderRef] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    if (unitPrice < 0) newErrors.unitPrice = 'Unit price cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const newItem: Partial<WorkOrderInventoryItem> = {
      name: itemName,
      quantity,
      unitPrice,
      notes,
      category,
      sku,
      itemStatus: 'ordered',
      supplierName,
      estimatedArrivalDate: estimatedArrival ? estimatedArrival.toISOString() : undefined,
      supplierOrderRef
    };
    
    onSave(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-semibold mb-4">Add Special Order Item</h3>
      
      <div className="space-y-2">
        <Label htmlFor="itemName">Item Name*</Label>
        <Input
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className={errors.itemName ? 'border-red-500' : ''}
        />
        {errors.itemName && <p className="text-sm text-red-500">{errors.itemName}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity*</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price ($)*</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min={0}
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
            className={errors.unitPrice ? 'border-red-500' : ''}
          />
          {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={value => setCategory(value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Parts">Parts</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Fluids">Fluids</SelectItem>
              <SelectItem value="Materials">Materials</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sku">SKU/Part Number</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier Name</Label>
          <Input
            id="supplier"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplierOrderRef">Order Reference #</Label>
          <Input
            id="supplierOrderRef"
            value={supplierOrderRef}
            onChange={(e) => setSupplierOrderRef(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estimatedArrival">Estimated Arrival Date</Label>
        <DatePicker
          date={estimatedArrival}
          onDateChange={setEstimatedArrival}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Item
        </Button>
      </div>
    </form>
  );
}
