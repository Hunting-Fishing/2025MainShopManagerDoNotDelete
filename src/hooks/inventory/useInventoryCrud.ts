
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { 
  getAllInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  updateInventoryQuantity
} from "@/services/inventory/crudService";
import { toast } from "@/hooks/use-toast";

export function useInventoryCrud() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all inventory items
  const loadInventoryItems = async (): Promise<InventoryItemExtended[]> => {
    setLoading(true);
    setError(null);
    try {
      const items = await getAllInventoryItems();
      return items;
    } catch (err) {
      setError("Failed to load inventory items");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get a single inventory item
  const getItem = async (id: string): Promise<InventoryItemExtended | null> => {
    setLoading(true);
    setError(null);
    try {
      const item = await getInventoryItemById(id);
      return item;
    } catch (err) {
      setError(`Failed to load inventory item ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new inventory item
  const createItem = async (item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended | null> => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await createInventoryItem(item);
      toast({
        title: "Item created",
        description: `${newItem.name} has been added to inventory`,
        variant: "success"
      });
      return newItem;
    } catch (err) {
      setError("Failed to create inventory item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an inventory item
  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      toast({
        title: "Item updated",
        description: `${updatedItem.name} has been updated`,
        variant: "success"
      });
      return updatedItem;
    } catch (err) {
      setError(`Failed to update inventory item ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an inventory item
  const deleteItem = async (id: string, itemName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteInventoryItem(id);
      toast({
        title: "Item deleted",
        description: `${itemName} has been removed from inventory`,
        variant: "success"
      });
      return true;
    } catch (err) {
      setError(`Failed to delete inventory item ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update inventory quantities when consumed by work orders
  const consumeInventory = async (items: { id: string, quantity: number }[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Process each item one by one
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            // Negative quantity because we're consuming
            await updateInventoryQuantity(item.id, -item.quantity);
            return true;
          } catch (itemError: any) {
            // Log individual item errors but continue with others
            console.error(`Error updating item ${item.id}:`, itemError);
            return false;
          }
        })
      );

      // If any item failed, show a warning
      if (results.some(result => !result)) {
        toast({
          title: "Partial inventory update",
          description: "Some items could not be updated. Check inventory levels.",
          variant: "warning"
        });
        return false;
      }

      toast({
        title: "Inventory updated",
        description: "Inventory quantities have been updated",
        variant: "success"
      });
      return true;
    } catch (err) {
      setError("Failed to update inventory quantities");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loadInventoryItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    consumeInventory
  };
}
