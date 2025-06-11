
import React from 'react';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkOrderInventoryTabProps {
  workOrder: WorkOrder;
  inventoryItems: WorkOrderInventoryItem[];
  isEditMode: boolean;
}

export function WorkOrderInventoryTab({
  workOrder,
  inventoryItems,
  isEditMode
}: WorkOrderInventoryTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems && inventoryItems.length > 0 ? (
            <div className="space-y-4">
              {inventoryItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">${item.unit_price}</p>
                    <p className="font-medium">${item.total}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items found for this work order.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
