
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { WorkOrderInventoryItem } from '@/types/workOrder';

interface SelectedInventoryTableProps {
  items: WorkOrderInventoryItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export const SelectedInventoryTable: React.FC<SelectedInventoryTableProps> = ({
  items,
  onRemove,
  onUpdateQuantity
}) => {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center border rounded-md">
        <p className="text-muted-foreground">No inventory items selected</p>
      </div>
    );
  }

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(id, quantity);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.sku}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="w-20"
              />
            </TableCell>
            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
            <TableCell>${item.total.toFixed(2)}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
