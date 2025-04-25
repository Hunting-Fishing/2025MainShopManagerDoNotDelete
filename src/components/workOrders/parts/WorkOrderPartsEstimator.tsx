
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, X, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { InventoryItemExtended } from '@/types/inventory';
import { AddPartsDialog } from './AddPartsDialog';
import { EditPartQuantityDialog } from './EditPartQuantityDialog';

interface WorkOrderPartsEstimatorProps {
  items: WorkOrderInventoryItem[];
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
  showTotals?: boolean;
}

export function WorkOrderPartsEstimator({
  items,
  onItemsChange,
  readOnly = false,
  showTotals = true,
}: WorkOrderPartsEstimatorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);

  // Calculate total cost of all items
  const totalCost = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Handler for adding a new part
  const handleAddPart = (item: InventoryItemExtended, quantity: number) => {
    // Check if this item is already in the list
    const existingIndex = items.findIndex(
      existing => existing.id === item.id
    );

    if (existingIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      onItemsChange(updatedItems);
    } else {
      // Add new item
      const newItem: WorkOrderInventoryItem = {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: quantity,
        unitPrice: item.unitPrice,
      };
      onItemsChange([...items, newItem]);
    }
  };

  // Handler for adding multiple parts at once
  const handleAddItems = (newItems: WorkOrderInventoryItem[]) => {
    const updatedItems = [...items];
    
    for (const newItem of newItems) {
      const existingIndex = updatedItems.findIndex(
        existing => existing.id === newItem.id
      );

      if (existingIndex >= 0) {
        // Update existing item quantity
        updatedItems[existingIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        updatedItems.push(newItem);
      }
    }
    
    onItemsChange(updatedItems);
  };

  // Handler for removing a part
  const handleRemovePart = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  // Handler for editing part quantity
  const handleEditQuantity = (index: number, newQuantity: number) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    onItemsChange(updatedItems);
    setEditItemIndex(null);
  };

  return (
    <>
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">No parts or materials added yet.</p>
            {!readOnly && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Parts
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {!readOnly && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditItemIndex(index)}
                          >
                            <span className="sr-only">Edit</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemovePart(index)}
                          >
                            <span className="sr-only">Delete</span>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {showTotals && (
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="text-right font-medium">Total</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalCost)}
                    </TableCell>
                    {!readOnly && <TableCell />}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!readOnly && (
            <div className="flex justify-start">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add More Parts
              </Button>
            </div>
          )}
        </div>
      )}

      <AddPartsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onItemSelect={handleAddPart}
        onAddItems={handleAddItems}
      />

      {editItemIndex !== null && (
        <EditPartQuantityDialog
          open={editItemIndex !== null}
          onOpenChange={() => setEditItemIndex(null)}
          initialQuantity={items[editItemIndex].quantity}
          onConfirm={(quantity) => handleEditQuantity(editItemIndex, quantity)}
        />
      )}
    </>
  );
}
