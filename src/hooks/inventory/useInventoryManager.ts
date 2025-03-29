
import { useInventoryAlerts } from "./useInventoryAlerts";
import { useAutoReorder, type AutoReorderSettings } from "./useAutoReorder";
import { useManualReorder } from "./useManualReorder";
import { useEffect } from "react";

export type { AutoReorderSettings } from "./useAutoReorder";

export function useInventoryManager() {
  const { lowStockItems, outOfStockItems, checkInventoryAlerts } = useInventoryAlerts();
  const { autoReorderSettings, enableAutoReorder, disableAutoReorder, placeAutomaticOrder } = useAutoReorder();
  const { reorderItem } = useManualReorder();

  // This ensures that we check inventory alerts whenever the component that uses this hook mounts
  useEffect(() => {
    const checkAlerts = () => checkInventoryAlerts(placeAutomaticOrder, autoReorderSettings);
    checkAlerts();
  }, [checkInventoryAlerts, placeAutomaticOrder, autoReorderSettings]);

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    checkInventoryAlerts: () => checkInventoryAlerts(placeAutomaticOrder, autoReorderSettings),
    reorderItem
  };
}
