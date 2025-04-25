import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, { enabled: boolean; threshold: number; quantity: number }>>({});

  useEffect(() => {
    loadInventory();
    loadAutoReorderSettings();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setInventoryItems(data || []);
        filterStockItems(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAutoReorderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('auto_reorder_settings')
        .select('*');

      if (error) {
        console.error("Error loading auto reorder settings:", error);
      } else {
        const settings: Record<string, { enabled: boolean; threshold: number; quantity: number }> = {};
        data?.forEach(item => {
          settings[item.item_id] = {
            enabled: item.enabled,
            threshold: item.threshold,
            quantity: item.quantity
          };
        });
        setAutoReorderSettings(settings);
      }
    } catch (err) {
      console.error("Error loading auto reorder settings:", err);
    }
  };

  const filterStockItems = (items: InventoryItemExtended[]) => {
    const lowStock = items.filter(item => item.quantity !== null && item.reorder_point !== null && item.quantity <= item.reorder_point);
    const outOfStock = items.filter(item => item.quantity === 0);

    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
  };

  const createInventoryItem = async (items: any) => {
    try {
      if (Array.isArray(items)) {
        // Convert unit_price to number for each item
        const formattedItems = items.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price)
        }));
        
        const { data, error } = await supabase
          .from('inventory_items')
          .insert(formattedItems);
          
        if (error) throw error;
        return data;
      } else {
        // Single item case
        const item = {
          ...items,
          unit_price: parseFloat(items.unit_price)
        };
        
        const { data, error } = await supabase
          .from('inventory_items')
          .insert(item);
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return null;
    }
  };

  const updateInventoryItem = async (itemId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return null;
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        setError(error.message);
      } else {
        setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
        filterStockItems(inventoryItems.filter(item => item.id !== itemId));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const setReorderPoint = async (itemId: string, reorderPoint: number) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ reorder_point: reorderPoint })
        .eq('id', itemId);

      if (error) {
        setError(error.message);
      } else {
        setInventoryItems(inventoryItems.map(item =>
          item.id === itemId ? { ...item, reorder_point: reorderPoint } : item
        ));
        filterStockItems(inventoryItems.map(item =>
          item.id === itemId ? { ...item, reorder_point: reorderPoint } : item
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const reorderItem = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) {
        console.error("Error fetching inventory item:", itemError);
        return false;
      }

      if (!itemData) {
        console.error("Inventory item not found");
        return false;
      }

      const newQuantity = (itemData.quantity || 0) + quantity;

      const { data, error } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) {
        console.error("Error reordering inventory item:", error);
        return false;
      }

      setInventoryItems(inventoryItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      filterStockItems(inventoryItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error reordering inventory item:', error);
      return false;
    }
  };

  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('auto_reorder_settings')
        .upsert(
          { item_id: itemId, enabled: true, threshold: threshold, quantity: quantity },
          { onConflict: 'item_id' }
        );

      if (error) {
        console.error("Error enabling auto reorder:", error);
        return false;
      }

      setAutoReorderSettings(prevSettings => ({
        ...prevSettings,
        [itemId]: { enabled: true, threshold: threshold, quantity: quantity }
      }));
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error enabling auto reorder:', error);
      return false;
    }
  };

  const disableAutoReorder = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('auto_reorder_settings')
        .delete()
        .eq('item_id', itemId);

      if (error) {
        console.error("Error disabling auto reorder:", error);
      } else {
        setAutoReorderSettings(prevSettings => {
          const newSettings = { ...prevSettings };
          delete newSettings[itemId];
          return newSettings;
        });
      }
    } catch (error) {
      console.error('Error disabling auto reorder:', error);
    }
  };

  return {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    loading,
    error,
    autoReorderSettings,
    loadInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setReorderPoint,
    reorderItem,
    enableAutoReorder,
    disableAutoReorder,
  };
}
