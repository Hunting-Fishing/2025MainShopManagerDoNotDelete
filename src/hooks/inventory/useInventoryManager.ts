
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended, ReorderSettings } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { useManualReorder } from './useManualReorder';

export function useInventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, ReorderSettings>>({});
  const { reorderItem: manualReorderItem } = useManualReorder();

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) {
        throw error;
      }

      // Convert snake_case to camelCase for consistent property names
      const itemsWithCamelCase = data.map(item => ({
        ...item,
        reorderPoint: item.reorder_point,
        unitPrice: item.unit_price
      })) as InventoryItemExtended[];

      setInventoryItems(itemsWithCamelCase);

      // Filter out low stock items (quantity below reorder point but greater than 0)
      setLowStockItems(itemsWithCamelCase.filter(item => 
        item.quantity > 0 && item.quantity <= item.reorderPoint
      ));

      // Filter out out-of-stock items (quantity = 0)
      setOutOfStockItems(itemsWithCamelCase.filter(item => 
        item.quantity === 0
      ));

      // Also fetch auto-reorder settings for these items
      await fetchAutoReorderSettings();
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAutoReorderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const settings: Record<string, ReorderSettings> = {};
        data.forEach(setting => {
          settings[setting.item_id as string] = {
            itemId: setting.item_id as string,
            enabled: setting.enabled as boolean,
            threshold: setting.threshold as number,
            quantity: setting.quantity as number
          };
        });
        setAutoReorderSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching auto-reorder settings:', error);
    }
  };

  // Function to check if an item is in low stock
  const isLowStock = (item: InventoryItemExtended): boolean => {
    return item.quantity > 0 && item.quantity <= item.reorderPoint;
  };

  // Function to check if an item is out of stock
  const isOutOfStock = (item: InventoryItemExtended): boolean => {
    return item.quantity === 0;
  };

  // Function to enable auto-reorder for an item
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('inventory_auto_reorder')
        .upsert({
          item_id: itemId,
          enabled: true,
          threshold,
          quantity
        }, { onConflict: 'item_id' })
        .select();

      if (error) throw error;

      // Update local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: {
          itemId,
          enabled: true,
          threshold,
          quantity
        }
      }));

      toast({
        title: 'Auto-reorder Enabled',
        description: `Auto-reorder has been enabled for this item`,
      });

      return true;
    } catch (error) {
      console.error('Error enabling auto-reorder:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable auto-reorder',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Function to disable auto-reorder for an item
  const disableAutoReorder = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_auto_reorder')
        .update({ enabled: false })
        .eq('item_id', itemId);

      if (error) throw error;

      // Update local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          enabled: false
        }
      }));

      toast({
        title: 'Auto-reorder Disabled',
        description: `Auto-reorder has been disabled for this item`,
      });

      return true;
    } catch (error) {
      console.error('Error disabling auto-reorder:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable auto-reorder',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Function to update inventory quantity
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // Recategorize items
      const updatedItems = [...inventoryItems];
      const updatedItem = updatedItems.find(item => item.id === itemId);
      if (updatedItem) {
        updatedItem.quantity = newQuantity;
        
        // Update low stock items
        if (isLowStock(updatedItem)) {
          if (!lowStockItems.some(item => item.id === itemId)) {
            setLowStockItems([...lowStockItems, updatedItem]);
          }
        } else {
          setLowStockItems(lowStockItems.filter(item => item.id !== itemId));
        }
        
        // Update out of stock items
        if (isOutOfStock(updatedItem)) {
          if (!outOfStockItems.some(item => item.id === itemId)) {
            setOutOfStockItems([...outOfStockItems, updatedItem]);
          }
        } else {
          setOutOfStockItems(outOfStockItems.filter(item => item.id !== itemId));
        }
      }

      toast({
        title: 'Inventory Updated',
        description: `Item quantity updated to ${newQuantity}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Function to reserve inventory items for a work order
  const reserveInventory = async (items: WorkOrderInventoryItem[]) => {
    try {
      // Check if we have enough of each item
      for (const item of items) {
        const inventoryItem = inventoryItems.find(i => i.id === item.id);
        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new Error(`Not enough inventory for item: ${item.name}`);
        }
      }

      // If we have enough, update quantities
      for (const item of items) {
        const inventoryItem = inventoryItems.find(i => i.id === item.id);
        if (inventoryItem) {
          await updateItemQuantity(item.id, inventoryItem.quantity - item.quantity);
        }
      }

      return true;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reserve inventory',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Call the reorderItem function from useManualReorder
  const reorderItem = async (itemId: string, quantity: number) => {
    return manualReorderItem(itemId, quantity);
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    loading,
    autoReorderSettings,
    fetchInventoryItems,
    updateItemQuantity,
    enableAutoReorder,
    disableAutoReorder,
    reorderItem,
    reserveInventory
  };
}
