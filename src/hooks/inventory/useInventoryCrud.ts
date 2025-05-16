
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useInventoryCrud = () => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all inventory items
  const fetchItems = async (): Promise<InventoryItemExtended[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.from("inventory_items").select("*");

      if (error) throw error;

      const formattedItems = data.map((item) => ({
        ...item,
        price: item.unit_price, // Ensure price property exists
      })) as InventoryItemExtended[];

      setItems(formattedItems);
      return formattedItems;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error("Failed to load inventory items");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new inventory item
  const addItem = async (item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newItem = {
        name: item.name || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 10,
        unit_price: item.unit_price || 0,
        price: item.unit_price || 0, // Ensure price property exists
        category: item.category || '',
        supplier: item.supplier || '',
        status: item.status || 'In Stock',
        description: item.description || ''
      };

      const { data, error } = await supabase
        .from("inventory_items")
        .insert([newItem])
        .select();

      if (error) throw error;

      const createdItem = {
        ...data[0],
        price: data[0].unit_price // Ensure price property exists
      } as InventoryItemExtended;

      setItems([...items, createdItem]);
      toast.success("Item added successfully");
      return createdItem;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error("Failed to add item");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing inventory item
  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (updates.price && !updates.unit_price) {
        updates.unit_price = updates.price;
      }

      const { data, error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;

      const updatedItem = {
        ...data[0],
        price: data[0].unit_price // Ensure price property exists
      } as InventoryItemExtended;

      setItems(items.map((item) => (item.id === id ? updatedItem : item)));
      toast.success("Item updated successfully");
      return updatedItem;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error("Failed to update item");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update only the quantity of an item
  const updateQuantity = async (id: string, newQuantity: number): Promise<InventoryItemExtended | null> => {
    return updateItem(id, { quantity: newQuantity });
  };

  // Remove an inventory item
  const removeItem = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.from("inventory_items").delete().eq("id", id);

      if (error) throw error;

      setItems(items.filter((item) => item.id !== id));
      toast.success("Item removed successfully");
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error("Failed to remove item");
      return false;
    } finally {
      setIsLoading(false);
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
    removeItem,
  };
};
