
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { WorkOrderInventoryItem } from "@/types/workOrder";

export interface WorkOrderInventoryTableProps {
  items: WorkOrderInventoryItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateItem?: (id: string, updates: Partial<WorkOrderInventoryItem>) => void;
  workOrderId?: string;
}

export function WorkOrderInventoryTable({ 
  items, 
  onRemoveItem, 
  onUpdateQuantity,
  onUpdateItem,
  workOrderId 
}: WorkOrderInventoryTableProps) {
  // Calculate total inventory value
  const totalValue = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Handle item update - either use the provided onUpdateItem or fallback to onUpdateQuantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (onUpdateItem) {
      onUpdateItem(id, { quantity });
    } else {
      onUpdateQuantity(id, quantity);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Inventory Items</h3>
          <p className="text-sm text-gray-500">{items.length} items, total value: {formatCurrency(totalValue)}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No inventory items added yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Item" to add parts and inventory to this work order
          </p>
        </div>
      )}
    </div>
  );
}
