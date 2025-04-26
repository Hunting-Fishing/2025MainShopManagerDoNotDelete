
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventoryService';
import { InventoryItem } from '@/types/inventory';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await getInventoryItems();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory items");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return { items, loading, error, refreshInventory: () => {} };
}
