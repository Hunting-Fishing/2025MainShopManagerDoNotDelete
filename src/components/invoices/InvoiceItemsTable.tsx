
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';
import { InvoiceItem } from '@/types/invoice';
import { InvoiceItemRow } from './InvoiceItemRow';

export interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem?: (item: InvoiceItem) => void;
  onUpdateItemQuantity?: (id: string, quantity: number) => void;
  onUpdateItemDescription?: (id: string, description: string) => void;
  onUpdateItemPrice?: (id: string, price: number) => void;
  readOnly?: boolean;
}

export function InvoiceItemsTable({ 
  items, 
  onRemoveItem, 
  onUpdateItem = () => {}, 
  onUpdateItemQuantity,
  onUpdateItemDescription,
  onUpdateItemPrice,
  readOnly = false 
}: InvoiceItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        No items added to this invoice
      </div>
    );
  }

  const handleUpdate = (updatedItem: InvoiceItem) => {
    onUpdateItem(updatedItem);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right w-20">Qty</TableHead>
          <TableHead className="text-right w-32">Price</TableHead>
          <TableHead className="text-right w-32">Total</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <InvoiceItemRow 
            key={item.id} 
            item={item} 
            onRemove={onRemoveItem} 
            onUpdate={handleUpdate}
            readOnly={readOnly}
          />
        ))}
        <TableRow>
          <TableCell colSpan={3} className="text-right font-medium">
            Subtotal
          </TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(items.reduce((sum, item) => sum + item.total, 0))}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
}
