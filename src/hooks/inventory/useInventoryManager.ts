import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { mapToInventoryItemExtended } from '@/utils/inventoryAdapters';

export const useInventoryManager = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const { toast } = useToast();

  // Fetch inventory items from the database
  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      const mappedItems = mapToInventoryItemExtended(data || []);
      setItems(mappedItems);
      setFilteredItems(mappedItems);
      return mappedItems;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add a new inventory item
  const addInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;

      setItems(prevItems => [...prevItems, data]);
      setFilteredItems(prevItems => [...prevItems, data]);
      
      toast({
        title: "Item Added",
        description: `${item.name} has been added to inventory`,
      });

      return data;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove an inventory item
  const removeInventoryItem = async (itemId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Removed",
        description: "Item has been removed from inventory",
      });

      return true;
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to remove inventory item",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update an inventory item
  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItemExtended>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      setFilteredItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated",
      });

      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory items based on a search term
  const filterItems = useCallback((searchTerm: string) => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const newFilteredItems = items.filter(item =>
      item.name.toLowerCase().includes(normalizedSearchTerm) ||
      (item.sku && item.sku.toLowerCase().includes(normalizedSearchTerm)) ||
      (item.category && item.category.toLowerCase().includes(normalizedSearchTerm))
    );
    setFilteredItems(newFilteredItems);
  }, [items]);

  // Update inventory quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    setLoading(true);
    try {
      // Use the update_timestamp function which already exists
      const { error } = await supabase
        .rpc('check_inventory_availability', {
          item_id: itemId,
          requested_quantity: newQuantity
        });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Update the local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setFilteredItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      toast({
        title: "Quantity Updated",
        description: "Inventory quantity has been updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory quantity",
        variant: "destructive"
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
    fetchInventoryItems,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    filterItems,
    updateQuantity
  };
};
