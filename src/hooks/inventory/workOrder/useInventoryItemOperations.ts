
import { useState, useCallback } from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useInventoryItemOperations(workOrderId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    item: InventoryItemExtended;
    quantity: number;
  }[]>([]);
  
  // Fetch inventory items
  const fetchInventoryItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');
        
      if (error) throw error;
      
      setInventoryItems(data as InventoryItemExtended[]);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Add item to selected items
  const addItemToSelection = useCallback((item: InventoryItemExtended) => {
    setSelectedItems(prev => {
      // Check if item already exists
      const existingItemIndex = prev.findIndex(i => i.item.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if already exists
        const newItems = [...prev];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        return newItems;
      }
      
      // Add new item with quantity 1
      return [...prev, { item, quantity: 1 }];
    });
    
    toast({
      title: 'Item Added',
      description: `${item.name} added to work order`,
    });
  }, []);
  
  // Update quantity for selected item
  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedItems(prev => 
      prev.map(selection => 
        selection.item.id === itemId 
          ? { ...selection, quantity } 
          : selection
      )
    );
  }, []);
  
  // Remove item from selection
  const removeItem = useCallback((itemId: string) => {
    setSelectedItems(prev => prev.filter(selection => selection.item.id !== itemId));
    
    toast({
      title: 'Item Removed',
      description: 'Item removed from work order',
    });
  }, []);
  
  // Add all selected items to work order
  const addItemsToWorkOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      // Map selected items to work order items format
      const workOrderItems = selectedItems.map(selection => ({
        work_order_id: workOrderId,
        name: selection.item.name,
        sku: selection.item.sku,
        quantity: selection.quantity,
        unit_price: selection.item.unit_price,
        category: selection.item.category,
      }));
      
      // Insert items into work_order_inventory_items table
      const { error } = await supabase
        .from('work_order_inventory_items')
        .insert(workOrderItems);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${selectedItems.length} items added to work order`,
      });
      
      // Clear selection after adding to work order
      setSelectedItems([]);
      
    } catch (error) {
      console.error('Error adding items to work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to add items to work order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId, selectedItems]);
  
  return {
    isLoading,
    inventoryItems,
    selectedItems,
    fetchInventoryItems,
    addItemToSelection,
    updateItemQuantity,
    removeItem,
    addItemsToWorkOrder
  };
}
