
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended, AutoReorderSettings, ReorderSettings } from "@/types/inventory";
import { getInventoryStatus } from "@/utils/inventory/inventoryCalculations";
import { toast } from "sonner";
import { standardizeInventoryItem } from "@/utils/inventory/adapters";

export const useInventoryManager = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<ReorderSettings>({});
  
  // Fetch inventory items
  const { data: inventoryItems, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-items-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return (data || []).map(item => standardizeInventoryItem(item)) as InventoryItemExtended[];
    }
  });
  
  // Fetch auto-reorder settings
  const fetchAutoReorderSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .select('*');
        
      if (error) throw error;
      
      const settings: ReorderSettings = {};
      if (data) {
        data.forEach(item => {
          settings[item.item_id] = {
            enabled: item.enabled,
            threshold: item.threshold,
            quantity: item.quantity
          };
        });
      }
      
      setAutoReorderSettings(settings);
    } catch (error) {
      console.error("Error fetching auto-reorder settings:", error);
    }
  }, []);
  
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
  
  // Reorder an item manually
  const reorderItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      // Find the item
      const item = inventoryItems?.find(item => item.id === itemId);
      if (!item) {
        throw new Error("Item not found");
      }
      
      // Create a record in inventory_orders
      const { data, error } = await supabase
        .from('inventory_orders')
        .insert({
          item_id: itemId,
          quantity_ordered: quantity,
          supplier: item.supplier,
          expected_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          status: 'ordered'
        });
        
      if (error) throw error;
      
      toast({
        title: "Reorder placed",
        description: `Ordered ${quantity} units of ${item.name}`,
      });
      
      return data;
    } catch (error) {
      console.error("Error reordering item:", error);
      toast({
        title: "Error",
        description: "Failed to place reorder",
        variant: "destructive",
      });
      throw error;
    }
  }, [inventoryItems]);
  
  // Enable auto-reordering for an item
  const enableAutoReorder = useCallback(async (itemId: string, threshold: number, quantity: number) => {
    try {
      // Check if a setting already exists
      const { data: existing, error: checkError } = await supabase
        .from('inventory_auto_reorder')
        .select('*')
        .eq('item_id', itemId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw checkError;
      }
      
      let result;
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('inventory_auto_reorder')
          .update({
            enabled: true,
            threshold,
            quantity,
            updated_at: new Date().toISOString()
          })
          .eq('item_id', itemId);
          
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('inventory_auto_reorder')
          .insert({
            item_id: itemId,
            enabled: true,
            threshold,
            quantity
          });
          
        if (error) throw error;
        result = data;
      }
      
      // Update local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: {
          enabled: true,
          threshold,
          quantity
        }
      }));
      
      toast({
        title: "Auto-reorder enabled",
        description: `Auto-reorder set for when stock falls below ${threshold}`,
      });
      
      return result;
    } catch (error) {
      console.error("Error setting auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to enable auto-reorder",
        variant: "destructive",
      });
      throw error;
    }
  }, []);
  
  // Load auto-reorder settings on mount
  useEffect(() => {
    fetchAutoReorderSettings();
  }, [fetchAutoReorderSettings]);
  
  // Check alerts when inventory items change
  useEffect(() => {
    checkInventoryAlerts();
  }, [inventoryItems, checkInventoryAlerts]);
  
  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    isLoading,
    error,
    checkInventoryAlerts,
    refreshInventory: refetch,
    reorderItem,
    enableAutoReorder
  };
};

export type { AutoReorderSettings };
