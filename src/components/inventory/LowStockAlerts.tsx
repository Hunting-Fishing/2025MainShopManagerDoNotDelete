
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryManager } from "@/hooks/useInventoryManager";
import { NoInventoryAlerts } from "./alerts/NoInventoryAlerts";
import { AlertItemRow } from "./alerts/AlertItemRow";

export function LowStockAlerts() {
  const { 
    lowStockItems, 
    outOfStockItems, 
    reorderItem,
    enableAutoReorder,
    autoReorderSettings 
  } = useInventoryManager();
  
  const allAlertItems = [...lowStockItems, ...outOfStockItems];
  
  if (allAlertItems.length === 0) {
    return <NoInventoryAlerts />;
  }

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
                reorderItem={reorderItem}
                enableAutoReorder={enableAutoReorder}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
