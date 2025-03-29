
import { useEffect } from "react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { LowStockAlerts } from "./LowStockAlerts";
import { toast } from "@/hooks/use-toast";

export function InventoryAlerts() {
  const { checkInventoryAlerts, lowStockItems, outOfStockItems } = useInventoryManager();
  
  // Check for inventory alerts when the component mounts
  useEffect(() => {
    checkInventoryAlerts();
    
    // Show toast messages for any critical inventory issues
    if (outOfStockItems.length > 0) {
      toast({
        title: "Inventory Alert",
        description: `${outOfStockItems.length} items are out of stock and need attention`,
        variant: "destructive"
      });
    } else if (lowStockItems.length > 0) {
      toast({
        title: "Inventory Warning",
        description: `${lowStockItems.length} items are running low on stock`,
        variant: "warning"
      });
    }
    
    // In a real app, we might want to set up a polling interval here
    // to periodically check inventory levels
  }, [checkInventoryAlerts, lowStockItems.length, outOfStockItems.length]);

  return (
    <div className="space-y-6">
      <LowStockAlerts />
    </div>
  );
}
