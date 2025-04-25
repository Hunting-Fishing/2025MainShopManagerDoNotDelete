
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { useInventoryStatus } from '@/hooks/inventory/useInventoryStatus';

export function InventoryStatusCard() {
  // Pass an empty object to fix the error
  const { totalItems, lowStockItems, outOfStockItems, isLoading } = useInventoryStatus({});
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading inventory data...</div>
        ) : (
          <div className="space-y-2">
            <div>
              <div className="text-xl font-bold">{totalItems}</div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-semibold text-amber-500">{lowStockItems}</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-500">{outOfStockItems}</div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
