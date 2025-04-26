
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { InvoiceItem } from '@/types/invoice';

export interface InvoiceItemRowProps {
  item: InvoiceItem;
  readOnly?: boolean;
  onRemove: (id: string) => void;
  onUpdate: (item: InvoiceItem) => void;
}

export function InvoiceItemRow({ item, onRemove, onUpdate, readOnly = false }: InvoiceItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<InvoiceItem>(item);

  const handleEdit = () => {
    if (readOnly) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onUpdate(editedItem);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedItem(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedItem: InvoiceItem;

    if (name === 'quantity' || name === 'price') {
      const numValue = Number(value);
      updatedItem = {
        ...editedItem,
        [name]: numValue,
        total: name === 'quantity' ? numValue * editedItem.price : editedItem.quantity * numValue
      };
    } else {
      updatedItem = { ...editedItem, [name]: value };
    }

    setEditedItem(updatedItem);
  };

  return (
    <TableRow className="hover:bg-slate-50">
      {isEditing ? (
        <>
          <TableCell>
            <Input 
              name="name"
              value={editedItem.name} 
              onChange={handleChange}
              className="w-full"
            />
          </TableCell>
          <TableCell className="text-right">
            <Input 
              name="quantity"
              type="number" 
              min="1"
              value={editedItem.quantity} 
              onChange={handleChange}
              className="w-20 text-right"
            />
          </TableCell>
          <TableCell className="text-right">
            <Input 
              name="price"
              type="number" 
              min="0"
              step="0.01"
              value={editedItem.price} 
              onChange={handleChange}
              className="w-32 text-right"
            />
          </TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(editedItem.total)}
          </TableCell>
          <TableCell>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
            </div>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell onClick={handleEdit} className={readOnly ? '' : 'cursor-pointer'}>
            <div className="font-medium">{item.name}</div>
            {item.description && <div className="text-sm text-slate-500">{item.description}</div>}
          </TableCell>
          <TableCell onClick={handleEdit} className={`text-right ${readOnly ? '' : 'cursor-pointer'}`}>
            {item.quantity}
          </TableCell>
          <TableCell onClick={handleEdit} className={`text-right ${readOnly ? '' : 'cursor-pointer'}`}>
            {formatCurrency(item.price)}
          </TableCell>
          <TableCell onClick={handleEdit} className={`text-right font-medium ${readOnly ? '' : 'cursor-pointer'}`}>
            {formatCurrency(item.total)}
          </TableCell>
          <TableCell className="text-right">
            {!readOnly && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onRemove(item.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </Button>
            )}
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
