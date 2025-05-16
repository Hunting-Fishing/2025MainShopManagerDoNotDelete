
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { getInventoryStatus } from "@/utils/inventory/inventoryCalculations";

export const useInventoryManager = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  
  // Fetch inventory items
  const { data: inventoryItems, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-items-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as InventoryItemExtended[] || [];
    }
  });
  
  // Filter items by stock status
  const checkInventoryAlerts = useCallback(() => {
    if (!inventoryItems) return;
    
    const lowStock: InventoryItemExtended[] = [];
    const outOfStock: InventoryItemExtended[] = [];
    
    inventoryItems.forEach(item => {
      const status = getInventoryStatus(item.quantity, item.reorder_point);
      
      if (status === "Out of Stock") {
        outOfStock.push(item);
      } else if (status === "Low Stock") {
        lowStock.push(item);
      }
    });
    
    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
  }, [inventoryItems]);
  
  // Check alerts when inventory items change
  useEffect(() => {
    checkInventoryAlerts();
  }, [inventoryItems, checkInventoryAlerts]);
  
  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    isLoading,
    error,
    checkInventoryAlerts,
    refreshInventory: refetch
  };
};
