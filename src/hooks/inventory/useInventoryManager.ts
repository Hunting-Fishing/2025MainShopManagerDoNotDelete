
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { InventoryItemExtended } from "@/types/inventory";

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
        price: item.unit_price || 0,
        status: item.status || 'Low Stock',
        supplier: item.supplier || '',
        location: item.location || ''
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
        price: item.unit_price || 0,
        status: 'Out of Stock',
        supplier: item.supplier || '',
        location: item.location || ''
      })) || [];
      
      setLowStockItems(formattedLowStock);
      setOutOfStockItems(formattedOutOfStock);
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load inventory alerts on component mount
  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

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
        // In a real implementation, you might create a purchase order or supplier order here
        // For now, we'll just update the item quantity
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ 
            quantity: item.quantity + (quantity || autoReorderData.quantity || 10),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Auto-Reorder Initiated",
          description: `${quantity || autoReorderData.quantity || 10} units of ${item.name} have been ordered.`,
          variant: "default"
        });
        
        // Refresh inventory alerts
        await checkInventoryAlerts();
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

  return {
    lowStockItems,
    outOfStockItems,
    loading,
    checkInventoryAlerts,
    handleAutoReorder
  };
}
