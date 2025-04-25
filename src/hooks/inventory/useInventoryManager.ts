
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { mapDbToInventoryItem } from '@/services/inventory/utils';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';

export function useInventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});

  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        // Map DB items to our frontend model with proper type conversion
        const mappedItems: InventoryItemExtended[] = data.map(item => mapDbToInventoryItem(item));
        setInventoryItems(mappedItems);

        // Filter for low stock and out of stock
        const lowStock = mappedItems.filter(item => 
          item.quantity > 0 && item.quantity <= item.reorderPoint
        );
        setLowStockItems(lowStock);

        const outOfStock = mappedItems.filter(item => item.quantity <= 0);
        setOutOfStockItems(outOfStock);
      }

      // Fetch auto-reorder settings
      const { data: reorderData, error: reorderError } = await supabase
        .from('inventory_auto_reorder')
        .select('*');

      if (reorderError) {
        throw reorderError;
      }

      if (reorderData) {
        const settingsMap: Record<string, AutoReorderSettings> = {};
        reorderData.forEach(setting => {
          settingsMap[setting.item_id as string] = {
            enabled: setting.enabled,
            threshold: setting.threshold,
            quantity: setting.quantity
          };
        });
        setAutoReorderSettings(settingsMap);
      }

    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter inventory by low stock status
  const filterByLowStock = useCallback(() => {
    return inventoryItems.filter(item => 
      item.quantity > 0 && item.quantity <= item.reorderPoint
    );
  }, [inventoryItems]);

  // Filter inventory by out of stock status
  const filterByOutOfStock = useCallback(() => {
    return inventoryItems.filter(item => item.quantity <= 0);
  }, [inventoryItems]);

  // Check if a specific item is available in the requested quantity
  const checkItemAvailability = useCallback(async (itemId: string, requestedQuantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_inventory_availability', {
        item_id: itemId,
        requested_quantity: requestedQuantity
      });

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking inventory availability:', error);
      return false;
    }
  }, []);

  // Enable auto-reorder for an item
  const enableAutoReorder = useCallback(async (
    itemId: string, 
    threshold: number, 
    quantity: number
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .upsert({
          item_id: itemId,
          enabled: true,
          threshold: threshold,
          quantity: quantity
        })
        .select();

      if (error) {
        throw error;
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

      return true;
    } catch (error) {
      console.error('Error enabling auto-reorder:', error);
      return false;
    }
  }, []);

  // Disable auto-reorder for an item
  const disableAutoReorder = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .update({ enabled: false })
        .eq('item_id', itemId)
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          enabled: false
        }
      }));

      return true;
    } catch (error) {
      console.error('Error disabling auto-reorder:', error);
      return false;
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Consume inventory for work orders
  const consumeWorkOrderInventory = useCallback(async (items: WorkOrderInventoryItem[]): Promise<void> => {
    try {
      for (const item of items) {
        const { error } = await supabase.rpc('check_inventory_availability', {
          item_id: item.id,
          requested_quantity: item.quantity
        });

        if (error) {
          toast({
            title: "Inventory Error",
            description: `Not enough stock for ${item.name}`,
            variant: "destructive"
          });
          return;
        }
      }

      // If all items are available, consume them
      for (const item of items) {
        await supabase
          .from('inventory_adjustments')
          .insert({
            inventory_item_id: item.id,
            quantity: item.quantity,
            adjustment_type: 'consume',
            notes: 'Work order inventory consumption'
          });
      }

      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
    } catch (error) {
      console.error('Error consuming inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive"
      });
    }
  }, []);

  // Reserve inventory for work orders (without actual consumption)
  const reserveInventory = useCallback(async (items: WorkOrderInventoryItem[]): Promise<void> => {
    try {
      for (const item of items) {
        const { error } = await supabase.rpc('check_inventory_availability', {
          item_id: item.id,
          requested_quantity: item.quantity
        });

        if (error) {
          toast({
            title: "Inventory Error",
            description: `Not enough stock for ${item.name}`,
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Inventory items reserved successfully",
      });
    } catch (error) {
      console.error('Error reserving inventory:', error);
      toast({
        title: "Error",
        description: "Failed to reserve inventory items",
        variant: "destructive"
      });
    }
  }, []);

  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    loading,
    autoReorderSettings,
    fetchInventoryItems,
    filterByLowStock,
    filterByOutOfStock,
    checkItemAvailability,
    enableAutoReorder,
    disableAutoReorder,
    consumeWorkOrderInventory,
    reserveInventory
  };
}
