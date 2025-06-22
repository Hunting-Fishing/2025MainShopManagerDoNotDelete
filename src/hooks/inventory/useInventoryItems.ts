
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryItems() {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    console.log('useInventoryItems: Starting to fetch items...');
    setIsLoading(true);
    try {
      const data = await getInventoryItems();
      console.log('useInventoryItems: Received data:', data);
      console.log('useInventoryItems: Number of items:', data.length);
      
      if (data.length > 0) {
        console.log('useInventoryItems: First item:', data[0]);
      }
      
      setItems(data);
      return data;
    } catch (error) {
      console.error("useInventoryItems: Failed to fetch inventory items:", error);
      return [];
    } finally {
      setIsLoading(false);
      console.log('useInventoryItems: Finished loading');
    }
  };

  useEffect(() => {
    console.log('useInventoryItems: Component mounted, fetching items...');
    fetchItems();
  }, []);

  console.log('useInventoryItems: Current state - items:', items.length, 'isLoading:', isLoading);

  return { items, isLoading, fetchItems };
}
