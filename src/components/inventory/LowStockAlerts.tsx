
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { NoInventoryAlerts } from "./alerts/NoInventoryAlerts";
import { AlertItemRow } from "./alerts/AlertItemRow";
import { reorderItem, enableAutoReorder } from "@/services/inventoryService";

export function LowStockAlerts() {
  const { 
    lowStockItems, 
    outOfStockItems, 
    autoReorderSettings,
  } = useInventoryManager();
  
  const allAlertItems = [...lowStockItems, ...outOfStockItems];
  
  if (allAlertItems.length === 0) {
    return <NoInventoryAlerts />;
  }

  // Type-safe wrapper functions to match the expected return types
  const handleReorderItem = async (itemId: string, quantity: number) => {
    return await reorderItem(itemId, quantity);
  };

  const handleEnableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    return await enableAutoReorder(itemId, threshold, quantity);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Inventory Alerts
        </CardTitle>
        <CardDescription>Items that require attention and reordering</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAlertItems.map(item => (
              <AlertItemRow 
                key={item.id}
                item={item}
                autoReorderSettings={autoReorderSettings}
                reorderItem={handleReorderItem}
                enableAutoReorder={handleEnableAutoReorder}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
