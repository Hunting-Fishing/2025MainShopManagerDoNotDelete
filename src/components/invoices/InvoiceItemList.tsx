
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { InvoiceItem } from '@/types/invoice';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceItemListProps {
  items: InvoiceItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateDescription: (id: string, description: string) => void;
}

export function InvoiceItemList({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateDescription
}: InvoiceItemListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-slate-50">
        <p className="text-muted-foreground">No items added yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add items from inventory or create a labor entry.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="w-24 text-right">Qty</TableHead>
          <TableHead className="w-32 text-right">Price</TableHead>
          <TableHead className="w-32 text-right">Total</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <div className="font-medium">{item.name}</div>
                <Textarea
                  className="mt-1 text-sm text-muted-foreground resize-none min-h-[60px]"
                  value={item.description || ''}
                  onChange={(e) => onUpdateDescription(item.id, e.target.value)}
                  placeholder="Add description..."
                />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Input
                type="number"
                min="1"
                className="w-16 text-right ml-auto"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
              />
            </TableCell>
            <TableCell className="text-right">
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-24 text-right ml-auto"
                value={item.price}
                onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
              />
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(item.total)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default InvoiceItemList;
