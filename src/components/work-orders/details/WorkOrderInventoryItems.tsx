
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface WorkOrderInventoryItemsProps {
  workOrder: WorkOrder;
  inventoryItems?: WorkOrderInventoryItem[];
}

export function WorkOrderInventoryItems({ workOrder, inventoryItems }: WorkOrderInventoryItemsProps) {
  // Use items from workOrder if available, otherwise use provided items or empty array
  const items = workOrder.inventoryItems || inventoryItems || [];
  
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
  
  if (!items.length) {
    return (
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-slate-500">No inventory items added to this work order</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by status
  const groupedItems = items.reduce((acc, item) => {
    const status = item.itemStatus || "in-stock";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(item);
    return acc;
  }, {} as Record<string, WorkOrderInventoryItem[]>);

  // Calculate total by status
  const totalsByStatus = Object.entries(groupedItems).reduce((acc, [status, statusItems]) => {
    // Explicitly type statusItems as WorkOrderInventoryItem[] to fix the TypeScript error
    const typedItems = statusItems as WorkOrderInventoryItem[];
    acc[status] = typedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return acc;
  }, {} as Record<string, number>);

  // Overall total
  const overallTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Inventory Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                SKU
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          {item.name}
                          {item.notes && (
                            <div className="text-xs text-slate-500 truncate max-w-xs">
                              Note: {item.notes.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {item.notes && (
                        <TooltipContent>
                          <p className="max-w-xs">{item.notes}</p>
                          {item.estimatedArrivalDate && (
                            <p className="text-xs font-medium mt-1">
                              Expected: {new Date(item.estimatedArrivalDate).toLocaleDateString()}
                            </p>
                          )}
                          {item.supplierName && (
                            <p className="text-xs">Supplier: {item.supplierName}</p>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {getStatusBadge(item.itemStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            {/* Subtotals by status */}
            {Object.entries(totalsByStatus).map(([status, total]) => (
              <tr key={status} className="text-xs">
                <td colSpan={3} className="px-6 py-2 text-right font-medium">
                  {status === "in-stock" ? "In Stock Items" :
                   status === "ordered" ? "Ordered Items" :
                   status === "special-order" ? "Special Order Items" :
                   status === "used-part" ? "Used Parts" :
                   status === "misc" ? "Miscellaneous Items" : 
                   "Items"} Subtotal:
                </td>
                <td colSpan={3} className="px-6 py-2 text-right"></td>
                <td className="px-6 py-2 text-right font-medium">
                  ${total.toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Overall total */}
            <tr>
              <td colSpan={6} className="px-6 py-3 text-right text-sm font-bold">
                Total:
              </td>
              <td className="px-6 py-3 text-right text-sm font-bold">
                ${overallTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
}
