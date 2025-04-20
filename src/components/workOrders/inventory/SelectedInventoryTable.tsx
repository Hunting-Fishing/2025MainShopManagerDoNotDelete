
import React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface SelectedInventoryTableProps {
  items: WorkOrderInventoryItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const SelectedInventoryTable: React.FC<SelectedInventoryTableProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-6 border border-dashed rounded-md text-center text-slate-500">
        No inventory items added yet. Use the button above to add items from inventory.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{item.sku}</td>
              <td className="px-4 py-3 text-sm text-center">
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                    className="h-7 w-16 mx-1 text-center"
                    min={1}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-medium text-right">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-red-500"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
