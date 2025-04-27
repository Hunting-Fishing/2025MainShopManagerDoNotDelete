
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { InventoryQuantityManager } from "./InventoryQuantityManager";
import { Badge } from "@/components/ui/badge";

interface WorkOrderInventoryTableProps {
  items: WorkOrderInventoryItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const WorkOrderInventoryTable: React.FC<WorkOrderInventoryTableProps> = ({
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
      case "ordered":
        return <Badge className="bg-blue-500 hover:bg-blue-600">On Order</Badge>;
      case "special-order":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Special Order</Badge>;
      case "used-part":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Used Part</Badge>;
      case "misc":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Miscellaneous</Badge>;
      default:
        return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm font-medium">
                <div>
                  {item.name}
                  {item.notes && (
                    <div className="text-xs text-slate-500 truncate max-w-xs">
                      {item.notes}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{item.sku}</td>
              <td className="px-4 py-3 text-sm text-center">
                {getStatusBadge(item.itemStatus)}
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <InventoryQuantityManager
                  itemId={item.id}
                  quantity={item.quantity}
                  onUpdateQuantity={onUpdateQuantity}
                />
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
        <tfoot className="bg-slate-50">
          <tr>
            <td colSpan={5} className="px-4 py-2 text-right text-sm font-medium">Total:</td>
            <td className="px-4 py-2 text-right text-sm font-bold">
              ${items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
