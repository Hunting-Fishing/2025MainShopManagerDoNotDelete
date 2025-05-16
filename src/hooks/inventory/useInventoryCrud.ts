
import { useState } from "react";
import { toast } from "sonner";
import { 
  getInventoryItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from "@/services/inventory/crudService";
import { InventoryItemExtended } from "@/types/inventory";

export function useInventoryCrud() {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getInventoryItems();
      setItems(data);
      return data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast.error('Failed to load inventory items');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const addItem = async (item: Partial<InventoryItemExtended>) => {
    setIsLoading(true);
    try {
      const newItem = await createInventoryItem(item);
      setItems(prev => [...prev, newItem]);
      toast.success('Item added successfully');
      return newItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error('Failed to add item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>) => {
    setIsLoading(true);
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      toast.success('Item updated successfully');
      return updatedItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast.error('Failed to update item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateQuantity = async (id: string, newQuantity: number) => {
    return updateItem(id, { quantity: newQuantity });
  };
  
  const removeItem = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed successfully');
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast.error('Failed to remove item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    items,
    fetchItems,
    addItem,
    updateItem,
    updateQuantity,
    removeItem
  };
}
