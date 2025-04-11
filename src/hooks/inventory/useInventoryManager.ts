
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { InventoryItemExtended } from "@/types/inventory";

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});

  const checkInventoryAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch items with low stock
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantity', 0)
        .lte('quantity', supabase.rpc('get_setting_value', { setting_key: 'low_stock_threshold' }) || 5);
        
      if (lowStockError) throw lowStockError;
      
      // Fetch items out of stock
      const { data: outOfStockData, error: outOfStockError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('quantity', 0);
        
      if (outOfStockError) throw outOfStockError;
      
      // Process low stock items
      const formattedLowStock: InventoryItemExtended[] = lowStockData?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        reorderPoint: item.reorder_point || 5,
        unitPrice: item.unit_price || 0,
        price: item.unit_price || 0,
        location: item.location || '',
        status: item.status || 'Low Stock',
        supplier: item.supplier || ''
      })) || [];
      
      // Process out of stock items
      const formattedOutOfStock: InventoryItemExtended[] = outOfStockData?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        sku: item.sku || '',
        quantity: 0,
        reorderPoint: item.reorder_point || 5,
        unitPrice: item.unit_price || 0,
        price: item.unit_price || 0,
        location: item.location || '',
        status: 'Out of Stock',
        supplier: item.supplier || ''
      })) || [];
      
      setLowStockItems(formattedLowStock);
      setOutOfStockItems(formattedOutOfStock);

      // Load auto-reorder settings
      await loadAutoReorderSettings();
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAutoReorderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .select('*');

      if (error) throw error;
      
      const settings: Record<string, AutoReorderSettings> = {};
      if (data) {
        data.forEach(item => {
          settings[item.item_id] = {
            enabled: item.enabled || false,
            threshold: item.threshold || 5,
            quantity: item.quantity || 10
          };
        });
      }
      
      setAutoReorderSettings(settings);
    } catch (error) {
      console.error('Error loading auto-reorder settings:', error);
    }
  };

  // Load inventory alerts on component mount
  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

  const reorderItem = async (itemId: string, quantity: number) => {
    try {
      // Find the item to reorder
      const item = [...lowStockItems, ...outOfStockItems].find(item => item.id === itemId);
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Update inventory with new quantity
      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          quantity: item.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
        
      if (error) throw error;
      
      toast({
        title: "Reorder Successful",
        description: `${quantity} units of ${item.name} have been reordered.`,
        variant: "default"
      });
      
      // Refresh inventory alerts
      await checkInventoryAlerts();
    } catch (error) {
      console.error('Error reordering item:', error);
      toast({
        title: "Reorder Failed",
        description: "There was an issue processing the reorder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    try {
      const { data, error: checkError } = await supabase
        .from('inventory_auto_reorder')
        .select('*')
        .eq('item_id', itemId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (data) {
        // Update existing
        const { error } = await supabase
          .from('inventory_auto_reorder')
          .update({ 
            enabled: true,
            threshold,
            quantity,
            updated_at: new Date().toISOString()
          })
          .eq('item_id', itemId);
          
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('inventory_auto_reorder')
          .insert({
            item_id: itemId,
            enabled: true,
            threshold,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Auto-Reorder Enabled",
        description: `Auto-reorder has been set up for this item.`,
        variant: "default"
      });
      
      // Refresh settings
      await loadAutoReorderSettings();
    } catch (error) {
      console.error('Error enabling auto-reorder:', error);
      toast({
        title: "Setting Update Failed",
        description: "There was an issue updating auto-reorder settings.",
        variant: "destructive"
      });
    }
  };

  const handleAutoReorder = async (item: InventoryItemExtended, quantity: number) => {
    try {
      // Get auto-reorder settings
      const { data: autoReorderData, error: settingsError } = await supabase
        .from('inventory_auto_reorder')
        .select('*')
        .eq('item_id', item.id)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      
      // If auto-reorder is enabled, create a reorder entry
      if (autoReorderData?.enabled) {
        await reorderItem(item.id, quantity || autoReorderData.quantity || 10);
      }
    } catch (error) {
      console.error('Error in auto-reorder:', error);
      toast({
        title: "Auto-Reorder Failed",
        description: "There was an issue processing the auto-reorder. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Inventory availability checking for work orders
  const checkItemAvailability = async (itemId: string, requiredQuantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', itemId)
        .single();
        
      if (error) throw error;
      
      return data && data.quantity >= requiredQuantity;
    } catch (error) {
      console.error('Error checking item availability:', error);
      return false;
    }
  };

  // Reserve inventory for a work order
  const reserveInventory = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      // Get current quantity
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', itemId)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!data || data.quantity < quantity) {
        return false; // Not enough inventory
      }
      
      // Update quantity (reserving it)
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: data.quantity - quantity })
        .eq('id', itemId);
        
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      return false;
    }
  };

  // Consume inventory when work order is completed
  const consumeWorkOrderInventory = async (workOrderId: string): Promise<boolean> => {
    try {
      // Get all items for this work order
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('work_order_id', workOrderId);
        
      if (error) throw error;
      
      // Nothing to do if no parts
      if (!data || data.length === 0) return true;
      
      // We don't need to do anything else here as inventory was already
      // reserved when the part was added to the work order
      
      return true;
    } catch (error) {
      console.error('Error consuming work order inventory:', error);
      return false;
    }
  };

  return {
    lowStockItems,
    outOfStockItems,
    loading,
    checkInventoryAlerts,
    handleAutoReorder,
    reorderItem,
    enableAutoReorder,
    autoReorderSettings,
    checkItemAvailability,
    reserveInventory,
    consumeWorkOrderInventory
  };
}
