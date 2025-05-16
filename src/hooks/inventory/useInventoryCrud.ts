
import { useState } from 'react';
import { 
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryItem
} from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryCrud() {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load all inventory items
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventoryItems();
      setItems(data);
      return data;
    } catch (e) {
      const err = e as Error;
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new inventory item
  const addItem = async (item: InventoryItemExtended) => {
    try {
      // Ensure required fields are present
      const completeItem: Omit<InventoryItemExtended, "id"> = {
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        reorder_point: item.reorder_point,
        unit_price: item.unit_price,
        category: item.category,
        supplier: item.supplier,
        status: item.status,
        description: item.description || ""
      };
      
      const newItem = await createInventoryItem(completeItem);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    }
  };

  // Update an existing inventory item
  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>) => {
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    }
  };

  // Update just the quantity of an item
  const updateQuantity = async (id: string, newQuantity: number) => {
    return updateItem(id, { quantity: newQuantity });
  };

  // Remove an inventory item
  const removeItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    fetchItems,
    addItem,
    updateItem,
    updateQuantity,
    removeItem
  };
}
