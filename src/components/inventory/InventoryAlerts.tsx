
import { useEffect } from "react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { LowStockAlerts } from "./LowStockAlerts";

export function InventoryAlerts() {
  const { checkInventoryAlerts } = useInventoryManager();
  
  // Check for inventory alerts when the component mounts
  useEffect(() => {
    checkInventoryAlerts();
    // In a real app, we might want to set up a polling interval here
    // to periodically check inventory levels
  }, [checkInventoryAlerts]);

  return (
    <div className="space-y-6">
      <LowStockAlerts />
    </div>
  );
}
