import React from 'react';
import { useInventoryStatus } from '@/hooks/inventory/useInventoryStatus';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InventoryAlerts() {
  const { lowStockItems, outOfStockItems } = useInventoryStatus({});
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          Low Stock Items: {lowStockItems}
        </div>
        <div>
          Out of Stock Items: {outOfStockItems}
        </div>
      </CardContent>
    </Card>
  );
}
