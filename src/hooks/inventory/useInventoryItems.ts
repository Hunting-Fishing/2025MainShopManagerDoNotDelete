
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryItems() {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getInventoryItems();
      setItems(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, isLoading, fetchItems };
}
