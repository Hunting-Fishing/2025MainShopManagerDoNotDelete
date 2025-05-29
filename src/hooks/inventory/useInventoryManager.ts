
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { getAutoReorderSettings } from '@/services/inventory/autoReorderService';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const [loading, setLoading] = useState(true);

  const checkInventoryAlerts = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      
      // Filter low stock items (quantity below reorder point but above 0)
      const lowStock = items.filter(item => 
        item.quantity > 0 && item.quantity <= item.reorder_point
      );
      
      // Filter out of stock items (quantity is 0)
      const outOfStock = items.filter(item => item.quantity <= 0);
      
      setLowStockItems(lowStock);
      setOutOfStockItems(outOfStock);

      // Fetch auto-reorder settings
      const settings = await getAutoReorderSettings();
      setAutoReorderSettings(settings);
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInventoryAlerts();
  }, []);

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    loading,
    checkInventoryAlerts
  };
}
