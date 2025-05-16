
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { countLowStockItems, countOutOfStockItems } from '@/services/inventory/utils';
import { InventoryItemExtended } from '@/types/inventory';

export const useInventoryManager = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkInventoryAlerts = async () => {
    setLoading(true);
    try {
      const items = await getInventoryItems();
      
      // Filter items for low stock and out of stock
      const lowStock = items.filter(item => {
        const quantity = Number(item.quantity);
        const reorderPoint = Number(item.reorder_point);
        return quantity > 0 && quantity <= reorderPoint;
      });
      
      const outOfStock = items.filter(item => {
        const quantity = Number(item.quantity);
        return quantity <= 0;
      });
      
      setLowStockItems(lowStock);
      setOutOfStockItems(outOfStock);
      setError(null);
    } catch (err) {
      setError('Failed to check inventory alerts');
      console.error('Error checking inventory alerts:', err);
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
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    checkInventoryAlerts,
    loading,
    error
  };
};
