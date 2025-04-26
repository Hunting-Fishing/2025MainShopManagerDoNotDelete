
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvoiceItem } from '@/types/invoice';
import { InventoryItem } from '@/types/inventory';

export interface InvoiceItemFormProps {
  onAddItem: (item: InvoiceItem) => void;
  inventoryItems?: InventoryItem[];
}

export function InvoiceItemForm({ onAddItem, inventoryItems = [] }: InvoiceItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the new item
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name,
      description,
      quantity,
      price,
      total: quantity * price
    };
    
    // Add the item
    onAddItem(newItem);
    
    // Reset the form
    setName('');
    setDescription('');
    setQuantity(1);
    setPrice(0);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div className="col-span-4">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Add Item</Button>
      </div>
    </form>
  );
}
