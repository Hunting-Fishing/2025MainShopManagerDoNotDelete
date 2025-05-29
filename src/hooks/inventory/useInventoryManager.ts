
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
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
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  return {
    lowStockItems,
    outOfStockItems,
    loading
  };
}
