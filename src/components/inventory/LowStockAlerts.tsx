
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { NoInventoryAlerts } from "./alerts/NoInventoryAlerts";
import AlertItemRow from "./alerts/AlertItemRow";
import { useState } from "react";
import { useManualReorder } from "@/hooks/inventory/useManualReorder";

export function LowStockAlerts() {
  const { 
    lowStockItems, 
    outOfStockItems,
    autoReorderSettings
  } = useInventoryManager();
  
  const { reorderItem } = useManualReorder();
  
  // Create a function to enable auto-reorder
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    try {
      // Implementation would be here in a real app
      console.log(`Setting auto-reorder for ${itemId} at threshold ${threshold} for ${quantity} units`);
      // In a real app, we would call an API or update a database
      return Promise.resolve();
    } catch (error) {
      console.error("Error enabling auto-reorder:", error);
      return Promise.reject(error);
    }
  };
  
  // Wrapper functions to adapt the return types to void
  const handleReorderItem = async (itemId: string, quantity: number) => {
    await reorderItem(itemId, quantity);
    return; // Ensure it returns void
  };
  
  const handleEnableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    await enableAutoReorder(itemId, threshold, quantity);
    return; // Ensure it returns void
  };
  
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
