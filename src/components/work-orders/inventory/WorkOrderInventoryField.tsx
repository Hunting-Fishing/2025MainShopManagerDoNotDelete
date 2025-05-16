
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Plus, Trash } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderInventoryItem } from '@/types/workOrder';

export interface WorkOrderInventoryFieldProps {
  inventoryItems?: WorkOrderInventoryItem[];
  onAdd?: (item: WorkOrderInventoryItem) => void;
  onRemove?: (id: string) => void;
  form?: any; // Allow form to be passed in
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({
  inventoryItems = [],
  onAdd,
  onRemove,
  form
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddItem = () => {
    setShowAddDialog(true);
  };

  const handleRemoveItem = (id: string) => {
    if (onRemove) {
      onRemove(id);
    }
  };

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Create a new item with default values
  const createNewItem = (): WorkOrderInventoryItem => {
    return {
      id: crypto.randomUUID(),
      name: '',
      sku: '',
      category: 'Parts',
      quantity: 1,
      unitPrice: 0,
      itemStatus: 'in-stock',
    };
  };

  const handleAddSpecialOrder = (partialItem: Partial<WorkOrderInventoryItem>) => {
    if (onAdd) {
      onAdd({
        ...createNewItem(),
        ...partialItem,
        // Make sure we don't include properties that aren't in WorkOrderInventoryItem
        name: partialItem.name || '',
        quantity: partialItem.quantity || 1,
        unitPrice: partialItem.unitPrice || 0,
        itemStatus: partialItem.itemStatus || 'ordered',
      });
    }
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Parts & Materials</h3>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.length > 0 ? (
              inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                      {item.itemStatus || 'in-stock'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No parts or materials added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showAddDialog && (
        <div className="border rounded-md p-4 mt-4 bg-muted/50">
          <h4 className="font-medium mb-4">Add Special Order Item</h4>
          {/* Special order form would go here */}
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAddSpecialOrder({ name: 'New Special Order' })}>Add Item</Button>
          </div>
        </div>
      )}
    </div>
  );
};
