
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

interface InventoryAvailability {
  available: boolean;
  message: string;
  availableQuantity?: number;
}

/**
 * Hook for managing inventory operations across the application
 */
export const useInventoryManager = () => {
  const [loading, setLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState({ enabled: false });

  // Fetch inventory alerts (low stock and out of stock)
  const checkInventoryAlerts = useCallback(async () => {
    try {
      setLoading(true);
      // Get low stock items
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('inventory_items')
        .select('*')
        .lt('quantity', 'reorder_point')
        .gt('quantity', 0);

      if (lowStockError) throw lowStockError;
      
      // Get out of stock items
      const { data: outOfStockData, error: outOfStockError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('quantity', 0);

      if (outOfStockError) throw outOfStockError;

      // Get auto-reorder settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('inventory_settings')
        .select('auto_reorder_enabled')
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') { 
        // PGRST116 is "no rows returned" which is fine, use default
        throw settingsError;
      }

      setLowStockItems(lowStockData || []);
      setOutOfStockItems(outOfStockData || []);
      setAutoReorderSettings({
        enabled: settingsData?.auto_reorder_enabled || false
      });
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check item availability for work order operations
  const checkItemAvailability = useCallback(async (
    itemId: string, 
    quantity: number
  ): Promise<InventoryAvailability> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('quantity, name')
        .eq('id', itemId)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        return {
          available: false,
          message: 'Item not found in inventory'
        };
      }
      
      if (data.quantity < quantity) {
        return {
          available: false,
          message: `Only ${data.quantity} units of ${data.name} available`,
          availableQuantity: data.quantity
        };
      }
      
      return {
        available: true,
        message: 'Item available'
      };
    } catch (error) {
      console.error('Error checking item availability:', error);
      return {
        available: false,
        message: 'Error checking inventory availability'
      };
    }
  }, []);

  // Reserve inventory for work order (when work order status changes to in-progress)
  const reserveInventory = useCallback(async (items: {id: string, quantity: number}[]) => {
    try {
      // For each item, create a transaction but don't actually update the quantity yet
      for (const item of items) {
        // Create transaction record
        const { error } = await supabase
          .from('inventory_transactions')
          .insert({
            inventory_item_id: item.id,
            quantity: item.quantity,
            transaction_type: 'reserve',
            reference_type: 'work_order',
            notes: 'Reserved for work order'
          });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      toast({
        title: "Error",
        description: "Failed to reserve inventory items",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  // Consume inventory when work order is completed
  const consumeWorkOrderInventory = useCallback(async (items: {id: string, quantity: number}[]) => {
    try {
      // First, check if all items are available
      const availabilityChecks = await Promise.all(
        items.map(item => checkItemAvailability(item.id, item.quantity))
      );
      
      // If any items are not available, don't proceed
      const unavailableItems = availabilityChecks.filter(check => !check.available);
      if (unavailableItems.length > 0) {
        toast({
          title: "Inventory Issue",
          description: "Some items are not available in sufficient quantity",
          variant: "destructive"
        });
        return false;
      }
      
      // For each item, update quantity and create transaction
      for (const item of items) {
        // Update inventory quantity
        const { error: updateError } = await supabase.rpc('update_inventory_quantity', {
          item_id: item.id,
          quantity_change: -item.quantity
        });
        
        if (updateError) throw updateError;
        
        // Create transaction record
        const { error: transError } = await supabase
          .from('inventory_transactions')
          .insert({
            inventory_item_id: item.id,
            quantity: item.quantity,
            transaction_type: 'consumption',
            reference_type: 'work_order',
            notes: 'Consumed for work order'
          });
          
        if (transError) throw transError;
      }
      
      toast({
        title: "Inventory Updated",
        description: "Inventory has been consumed for this work order",
      });
      
      return true;
    } catch (error) {
      console.error('Error consuming inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory items",
        variant: "destructive"
      });
      return false;
    }
  }, [checkItemAvailability]);

  // Pre-load inventory alerts when the hook is first used
  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

  return {
    loading,
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    checkInventoryAlerts,
    checkItemAvailability,
    reserveInventory,
    consumeWorkOrderInventory
  };
};
