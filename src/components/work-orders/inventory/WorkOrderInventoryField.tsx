
import React from "react";
import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderInventoryFieldProps {
  control: Control<any>;
  inventoryItems: WorkOrderInventoryItem[];
  onRemoveItem: (index: number) => void;
  onShowAddDialog: () => void;
  onShowSpecialOrderDialog: () => void;
  name?: string;
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({
  control,
  inventoryItems,
  onRemoveItem,
  onShowAddDialog,
  onShowSpecialOrderDialog,
  name = "inventoryItems"
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Parts & Materials</Label>
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onShowAddDialog}
          >
            <Package className="mr-2 h-4 w-4" />
            Add Inventory Item
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onShowSpecialOrderDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Special Order
          </Button>
        </div>
      </div>
      
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            {inventoryItems.length === 0 ? (
              <div className="border border-dashed rounded-md p-6 text-center text-muted-foreground">
                No inventory items added. Click "Add Inventory Item" or "Special Order" to add parts.
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Item</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item, index) => {
                      // Handle both field naming conventions safely
                      const unitPrice = item.unitPrice ?? 0;
                      const quantity = item.quantity ?? 1;
                      const total = unitPrice * quantity;
                      
                      return (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="p-3">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-slate-500">
                              {item.category && <span className="mr-2">{item.category}</span>}
                              {item.sku && <span>SKU: {item.sku}</span>}
                            </div>
                            {item.supplierName && (
                              <div className="text-xs text-slate-500">
                                Supplier: {item.supplierName}
                                {item.supplierOrderRef && ` (Ref: ${item.supplierOrderRef})`}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">{quantity}</td>
                          <td className="p-3 text-right">${unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">${total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.itemStatus)}`}>
                              {formatStatus(item.itemStatus)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onRemoveItem(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};

function getStatusColor(status?: string) {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-800';
    case 'ordered':
      return 'bg-blue-100 text-blue-800';
    case 'backordered':
      return 'bg-amber-100 text-amber-800';
    case 'out-of-stock':
      return 'bg-red-100 text-red-800';
    case 'special-order':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function formatStatus(status?: string) {
  if (!status) return 'Unknown';
  
  // Convert kebab-case to Title Case
  return status.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
