
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventoryService';
import { InventoryItem } from '@/types/inventory';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await getInventoryItems();
        setItems(data);
        setError(null);
        setConnectionOk(true);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory items");
        setConnectionOk(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const refreshInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventoryItems();
      setItems(data);
      setError(null);
      setConnectionOk(true);
    } catch (err) {
      console.error("Error refreshing inventory:", err);
      setError("Failed to refresh inventory items");
      setConnectionOk(false);
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, connectionOk, refreshInventory };
}
