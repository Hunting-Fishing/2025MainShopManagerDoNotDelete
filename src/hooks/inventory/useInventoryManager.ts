
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { mapDbToInventoryItem } from '@/services/inventory/utils';

export function useInventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const [loading, setLoading] = useState(true);

  // Load all inventory items
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*');

        if (error) throw error;

        // Transform the DB format to our frontend format
        const mappedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          supplier: item.supplier,
          quantity: item.quantity,
          reorderPoint: item.reorder_point,
          unitPrice: parseFloat(item.unit_price),
          location: item.location || "",
          status: item.status,
          description: item.description || ""
        }));

        setInventoryItems(mappedItems);
        
        // Filter low stock and out of stock items
        setLowStockItems(mappedItems.filter(item => 
          item.quantity > 0 && item.quantity <= item.reorderPoint
        ));
        setOutOfStockItems(mappedItems.filter(item => 
          item.quantity <= 0
        ));
      } catch (error) {
        console.error("Error loading inventory items:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    const loadAutoReorderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_auto_reorder')
          .select('*');

        if (error) throw error;

        const settings: Record<string, AutoReorderSettings> = {};
        for (const item of data) {
          settings[item.item_id] = {
            enabled: item.enabled,
            threshold: item.threshold,
            quantity: item.quantity
          };
        }
        setAutoReorderSettings(settings);
      } catch (error) {
        console.error("Error loading auto-reorder settings:", error);
      }
    };
    
    loadInventory();
    loadAutoReorderSettings();
  }, []);

  // Check if an item is available in the requested quantity
  const checkItemAvailability = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      
      if (data && data.quantity >= quantity) {
        return true;
      } else {
        toast({
          title: "Insufficient stock",
          description: `Only ${data?.quantity || 0} units available`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking item availability:", error);
      return false;
    }
  }, [toast]);

  // Function to reserve inventory
  const reserveInventory = useCallback(async (items: WorkOrderInventoryItem[]): Promise<boolean> => {
    // Implementation would go here
    console.log("Reserving inventory items:", items);
    return true;
  }, []);

  // Function to consume work order inventory
  const consumeWorkOrderInventory = useCallback(async (items: WorkOrderInventoryItem[]): Promise<boolean> => {
    try {
      // Implementation would go here
      console.log("Consuming inventory items:", items);
      return true;
    } catch (error) {
      console.error("Error consuming inventory:", error);
      return false;
    }
  }, []);

  // Function to reorder an inventory item
  const reorderItem = async (itemId: string, quantity: number = 10): Promise<boolean> => {
    try {
      // Implementation would go here
      console.log(`Reordering item ${itemId}, quantity: ${quantity}`);
      toast({
        title: "Order placed",
        description: `Ordered ${quantity} units of this item`,
      });
      return true;
    } catch (error) {
      console.error("Error reordering item:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to enable auto-reordering for an item
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .upsert({
          item_id: itemId,
          enabled: true,
          threshold,
          quantity
        });

      if (error) throw error;

      // Update our local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: { enabled: true, threshold, quantity }
      }));

      toast({
        title: "Auto-reorder enabled",
        description: `Item will be reordered when stock falls below ${threshold}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error enabling auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to enable auto-reorder",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to disable auto-reordering for an item
  const disableAutoReorder = async (itemId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .update({ enabled: false })
        .eq('item_id', itemId);

      if (error) throw error;

      // Update our local state
      setAutoReorderSettings(prev => {
        const newSettings = { ...prev };
        if (newSettings[itemId]) {
          newSettings[itemId].enabled = false;
        }
        return newSettings;
      });

      toast({
        title: "Auto-reorder disabled",
        description: "Auto-reorder has been disabled for this item",
      });
      
      return true;
    } catch (error) {
      console.error("Error disabling auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to disable auto-reorder",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    loading,
    checkItemAvailability,
    reserveInventory,
    consumeWorkOrderInventory,
    reorderItem,
    enableAutoReorder,
    disableAutoReorder
  };
}
