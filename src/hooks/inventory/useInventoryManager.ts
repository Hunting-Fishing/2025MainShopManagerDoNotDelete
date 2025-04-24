import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

export function useInventoryManager() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const { toast } = useToast();

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const inventoryItems: InventoryItemExtended[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        quantity: item.quantity,
        reorderPoint: item.reorder_point,
        unitPrice: parseFloat(item.unit_price),
        location: item.location || "",
        status: item.status,
        description: item.description || ""
      }));

      setItems(inventoryItems);
      setFilteredItems(inventoryItems);
      checkInventoryAlerts(inventoryItems);

      // Load auto reorder settings
      const settings: Record<string, AutoReorderSettings> = {};
      inventoryItems.forEach(item => {
        settings[item.id] = {
          enabled: false,
          threshold: item.reorderPoint || 5,
          quantity: Math.max(item.reorderPoint * 2 || 10, 10)
        };
      });
      setAutoReorderSettings(settings);

      return inventoryItems;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addInventoryItem = async (item: Omit<InventoryItemExtended, "id">) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([
          {
            name: item.name,
            sku: item.sku,
            category: item.category,
            supplier: item.supplier,
            quantity: item.quantity,
            reorder_point: item.reorderPoint,
            unit_price: item.unitPrice.toString(),
            location: item.location,
            status: item.status,
            description: item.description
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newItem: InventoryItemExtended = {
        id: data.id,
        name: data.name,
        sku: data.sku,
        category: data.category,
        supplier: data.supplier,
        quantity: data.quantity,
        reorderPoint: data.reorder_point,
        unitPrice: parseFloat(data.unit_price),
        location: data.location || "",
        status: data.status,
        description: data.description || ""
      };

      setItems(prevItems => [...prevItems, newItem]);
      setFilteredItems(prevItems => [...prevItems, newItem]);
      checkInventoryAlerts([...items, newItem]);
      toast({
        title: "Item Added",
        description: `${item.name} has been added to inventory`,
      });

      return newItem;
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>) => {
    setLoading(true);
    try {
      const updateData: { [key: string]: any } = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.sku) updateData.sku = updates.sku;
      if (updates.category) updateData.category = updates.category;
      if (updates.supplier) updateData.supplier = updates.supplier;
      if (updates.quantity) updateData.quantity = updates.quantity;
      if (updates.reorderPoint) updateData.reorder_point = updates.reorderPoint;
      if (updates.unitPrice) updateData.unit_price = updates.unitPrice.toString();
      if (updates.location) updateData.location = updates.location;
      if (updates.status) updateData.status = updates.status;
      if (updates.description) updateData.description = updates.description;

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem: InventoryItemExtended = {
        id: data.id,
        name: data.name,
        sku: data.sku,
        category: data.category,
        supplier: data.supplier,
        quantity: data.quantity,
        reorderPoint: data.reorder_point,
        unitPrice: parseFloat(data.unit_price),
        location: data.location || "",
        status: data.status,
        description: data.description || ""
      };

      setItems(prevItems =>
        prevItems.map(item => (item.id === id ? updatedItem : item))
      );
      setFilteredItems(prevItems =>
        prevItems.map(item => (item.id === id ? updatedItem : item))
      );
      checkInventoryAlerts(items.map(item => (item.id === id ? updatedItem : item)));
      toast({
        title: "Item Updated",
        description: `${updatedItem.name} has been updated`,
      });

      return updatedItem;
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast({
        title: "Error",
        description: `Failed to update inventory item ${id}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteInventoryItem = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== id));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== id));
      checkInventoryAlerts(items.filter(item => item.id !== id));
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted",
      });

      return true;
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error",
        description: `Failed to delete inventory item ${id}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantityChange: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', id)
        .single();

      if (error) throw error;

      const newQuantity = data.quantity + quantityChange;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', id);

      if (updateError) throw updateError;

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      setFilteredItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      checkInventoryAlerts(items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
      return true;
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkInventoryAlerts = useCallback((inventoryItems: InventoryItemExtended[]) => {
    const lowStock: InventoryItemExtended[] = [];
    const outOfStock: InventoryItemExtended[] = [];

    inventoryItems.forEach(item => {
      if (item.quantity <= 0) {
        outOfStock.push(item);
      } else if (item.quantity <= item.reorderPoint) {
        lowStock.push(item);
      }
    });

    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
  }, []);

  const reorderItem = async (itemId: string) => {
    setLoading(true);
    try {
      const settings = autoReorderSettings[itemId];
      if (!settings) {
        console.error(`Auto-reorder settings not found for item ${itemId}`);
        return;
      }

      const { error } = await supabase
        .from('inventory_adjustments')
        .insert({
          inventory_item_id: itemId,
          quantity: settings.quantity,
          adjustment_type: 'reorder',
          notes: 'Auto reorder'
        });

      if (error) throw error;

      await updateQuantity(itemId, settings.quantity);
      toast({
        title: "Item Reordered",
        description: `Reordered ${settings.quantity} of item ${itemId}`,
      });
    } catch (error) {
      console.error("Error reordering item:", error);
      toast({
        title: "Error",
        description: "Failed to reorder item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    setAutoReorderSettings(prevSettings => ({
      ...prevSettings,
      [itemId]: {
        enabled: true,
        threshold,
        quantity
      }
    }));
    toast({
      title: "Auto Reorder Enabled",
      description: `Auto reorder enabled for item ${itemId}`,
    });
  };

  // Add the checkItemAvailability method
  const checkItemAvailability = useCallback(async (itemId: string, requestedQuantity: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_inventory_availability', {
        item_id: itemId,
        requested_quantity: requestedQuantity
      });

      if (error) {
        console.error('Error checking inventory availability:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkItemAvailability:', error);
      return false;
    }
  }, []);

  const consumeWorkOrderInventory = async (items: { id: string; quantity: number }[]) => {
    setLoading(true);
    try {
      // Loop through each item and update the quantity
      for (const item of items) {
        const { data: currentItem, error: selectError } = await supabase
          .from('inventory_items')
          .select('quantity')
          .eq('id', item.id)
          .single();

        if (selectError) {
          console.error(`Error fetching inventory item ${item.id}:`, selectError);
          toast({
            title: "Error",
            description: `Failed to fetch inventory item ${item.id}`,
            variant: "destructive",
          });
          return false;
        }

        const newQuantity = currentItem.quantity - item.quantity;

        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ quantity: newQuantity })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Error updating inventory item ${item.id}:`, updateError);
          toast({
            title: "Error",
            description: `Failed to update inventory item ${item.id}`,
            variant: "destructive",
          });
          return false;
        }
      }

      // After successful updates, refresh the inventory items
      await fetchInventoryItems();

      toast({
        title: "Inventory Updated",
        description: "Inventory quantities have been updated",
      });
      return true;
    } catch (error) {
      console.error("Error consuming work order inventory:", error);
      toast({
        title: "Error",
        description: "Failed to consume work order inventory",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reserveInventory = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      // Fetch current quantity
      const { data: currentItem, error: selectError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', itemId)
        .single();

      if (selectError) {
        console.error(`Error fetching inventory item ${itemId}:`, selectError);
        toast({
          title: "Error",
          description: `Failed to fetch inventory item ${itemId}`,
          variant: "destructive",
        });
        return false;
      }

      // Check if there is enough quantity to reserve
      if (currentItem.quantity < quantity) {
        toast({
          title: "Error",
          description: `Not enough quantity to reserve for item ${itemId}`,
          variant: "destructive",
        });
        return false;
      }

      // Update the quantity
      const newQuantity = currentItem.quantity - quantity;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (updateError) {
        console.error(`Error updating inventory item ${itemId}:`, updateError);
        toast({
          title: "Error",
          description: `Failed to update inventory item ${itemId}`,
          variant: "destructive",
        });
        return false;
      }

      // After successful update, refresh the inventory items
      await fetchInventoryItems();

      toast({
        title: "Inventory Reserved",
        description: `Reserved ${quantity} of item ${itemId}`,
      });
      return true;
    } catch (error) {
      console.error("Error reserving inventory:", error);
      toast({
        title: "Error",
        description: "Failed to reserve inventory",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    items,
    filteredItems,
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    fetchInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateQuantity,
    checkInventoryAlerts,
    reorderItem,
    enableAutoReorder,
    checkItemAvailability,   // Add this method to the returned object
    consumeWorkOrderInventory,
    reserveInventory
  };
}
