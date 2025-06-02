
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { AddInventoryButton } from './AddInventoryButton';

interface WorkOrderInventorySectionProps {
  workOrderId: string;
  inventoryItems: WorkOrderInventoryItem[];
  isEditMode?: boolean;
}

export function WorkOrderInventorySection({
  workOrderId,
  inventoryItems,
  isEditMode = false
}: WorkOrderInventorySectionProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(inventoryItems);

  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems]);

  const totalValue = items.reduce((total, item) => total + (item.total || 0), 0);

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Parts & Inventory</CardTitle>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          {isEditMode && (
            <AddInventoryButton
              onShowDialog={() => {
                // Handle showing inventory dialog
                console.log('Show inventory dialog');
              }}
            />
          )}
        </div>
        
        {items.length > 0 && (
          <div className="flex gap-4 text-sm text-slate-600">
            <span>Total Items: {items.length}</span>
            <span>Total Value: ${totalValue.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No inventory items added yet</p>
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add parts and materials needed for this work order
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Inventory items will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
