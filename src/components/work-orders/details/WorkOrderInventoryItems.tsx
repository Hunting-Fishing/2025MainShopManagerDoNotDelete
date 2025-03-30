
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderInventoryItemsProps {
  workOrder: WorkOrder;
  inventoryItems?: WorkOrderInventoryItem[];
}

export function WorkOrderInventoryItems({ workOrder, inventoryItems }: WorkOrderInventoryItemsProps) {
  // Use items from workOrder if available, otherwise use provided items or empty array
  const items = workOrder.inventoryItems || inventoryItems || [];
  
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
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.sku}
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
        </table>
      </CardContent>
    </Card>
  );
}
