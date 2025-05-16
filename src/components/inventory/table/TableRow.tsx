
import React from 'react';
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { InventoryItemExtended } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

interface TableRowProps {
  item: InventoryItemExtended;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TableRow({ item, onEdit, onDelete }: TableRowProps) {
  const getStatusBadge = (quantity: number, reorderPoint: number) => {
    if (quantity <= 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border border-red-300">
          Out of Stock
        </Badge>
      );
    } else if (quantity <= reorderPoint) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border border-yellow-300">
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border border-green-300">
          In Stock
        </Badge>
      );
    }
  };

  return (
    <UITableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.sku}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{item.reorder_point}</TableCell>
      <TableCell>{getStatusBadge(item.quantity, item.reorder_point)}</TableCell>
      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.supplier}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(item.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </TableCell>
    </UITableRow>
  );
}
