
import React from 'react';
import { InvoiceItem } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface InvoiceItemFormProps {
  item?: InvoiceItem;
  onSave: (item: InvoiceItem) => void;
  onCancel: () => void;
}

export function InvoiceItemForm({ item, onSave, onCancel }: InvoiceItemFormProps) {
  const [formData, setFormData] = React.useState<Partial<InvoiceItem>>(
    item || {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
      hours: false,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let newValue: string | number = value;
    if (name === 'quantity' || name === 'price') {
      newValue = value === '' ? 0 : Number(value);
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Recalculate total when quantity or price changes
      if (name === 'quantity' || name === 'price') {
        updated.total = (updated.quantity || 0) * (updated.price || 0);
      }
      
      return updated;
    });
  };

  const handleHoursToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, hours: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as InvoiceItem);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item/Service Name</Label>
            <Input 
              id="name"
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange}
              placeholder="Item or service name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Unit Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="hours"
              checked={formData.hours || false}
              onCheckedChange={handleHoursToggle}
            />
            <Label htmlFor="hours">Track as Hours</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
