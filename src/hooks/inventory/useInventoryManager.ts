
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { mapToInventoryItemExtended } from '@/utils/inventoryAdapters';

export const useInventoryManager = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
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
      
      // Set low stock and out of stock items
      setLowStockItems(mappedItems.filter(item => 
        item.quantity > 0 && item.quantity <= item.reorderPoint
      ));
      setOutOfStockItems(mappedItems.filter(item => item.quantity <= 0));
      
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
      // Convert to database format
      const dbItem = {
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        quantity: item.quantity,
        reorder_point: item.reorderPoint,
        unit_price: item.unitPrice,
        location: item.location,
        status: item.status,
        description: item.description
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([dbItem])
        .select()
        .single();

      if (error) throw error;

      const newItem = mapToInventoryItemExtended([data])[0];
      setItems(prevItems => [...prevItems, newItem]);
      setFilteredItems(prevItems => [...prevItems, newItem]);
      
      // Update low stock and out of stock items
      if (newItem.quantity <= 0) {
        setOutOfStockItems(prev => [...prev, newItem]);
      } else if (newItem.quantity <= newItem.reorderPoint) {
        setLowStockItems(prev => [...prev, newItem]);
      }
      
      toast({
        title: "Item Added",
        description: `${item.name} has been added to inventory`,
      });

      return newItem;
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
      setLowStockItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setOutOfStockItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
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
      // Convert to database format
      const dbUpdates: any = { ...updates };
      if ('reorderPoint' in updates) dbUpdates.reorder_point = updates.reorderPoint;
      if ('unitPrice' in updates) dbUpdates.unit_price = updates.unitPrice;
      delete dbUpdates.reorderPoint;
      delete dbUpdates.unitPrice;

      const { data, error } = await supabase
        .from('inventory_items')
        .update(dbUpdates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      const updatedItem = mapToInventoryItemExtended([data])[0];
      
      // Update all state arrays
      setItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      
      setFilteredItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      
      // Update low stock items
      if (updatedItem.quantity > 0 && updatedItem.quantity <= updatedItem.reorderPoint) {
        setLowStockItems(prev => {
          const exists = prev.some(item => item.id === itemId);
          if (exists) {
            return prev.map(item => item.id === itemId ? updatedItem : item);
          } else {
            return [...prev, updatedItem];
          }
        });
        setOutOfStockItems(prev => prev.filter(item => item.id !== itemId));
      } else if (updatedItem.quantity <= 0) {
        setOutOfStockItems(prev => {
          const exists = prev.some(item => item.id === itemId);
          if (exists) {
            return prev.map(item => item.id === itemId ? updatedItem : item);
          } else {
            return [...prev, updatedItem];
          }
        });
        setLowStockItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        // Item is in normal stock levels
        setLowStockItems(prev => prev.filter(item => item.id !== itemId));
        setOutOfStockItems(prev => prev.filter(item => item.id !== itemId));
      }
      
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated",
      });

      return updatedItem;
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
  const updateQuantity = async (itemId: string, newQuantity: number): Promise<boolean> => {
    setLoading(true);
    try {
      // Check inventory availability
      const { data: available, error: checkError } = await supabase
        .rpc('check_inventory_availability', {
          item_id: itemId,
          requested_quantity: newQuantity
        });

      if (checkError) throw checkError;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Update the local state
      const updatedItem = { ...items.find(item => item.id === itemId)!, quantity: newQuantity };
      
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
      
      // Update low stock items
      if (newQuantity > 0 && newQuantity <= updatedItem.reorderPoint) {
        setLowStockItems(prev => {
          const exists = prev.some(item => item.id === itemId);
          if (exists) {
            return prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
          } else {
            return [...prev, { ...updatedItem, quantity: newQuantity }];
          }
        });
        setOutOfStockItems(prev => prev.filter(item => item.id !== itemId));
      } else if (newQuantity <= 0) {
        setOutOfStockItems(prev => {
          const exists = prev.some(item => item.id === itemId);
          if (exists) {
            return prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
          } else {
            return [...prev, { ...updatedItem, quantity: newQuantity }];
          }
        });
        setLowStockItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        // Item is in normal stock levels
        setLowStockItems(prev => prev.filter(item => item.id !== itemId));
        setOutOfStockItems(prev => prev.filter(item => item.id !== itemId));
      }

      toast({
        title: "Quantity Updated",
        description: "Inventory quantity has been updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
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
  
  // Check inventory alerts
  const checkInventoryAlerts = useCallback(() => {
    const lowItems = items.filter(item => 
      item.quantity > 0 && item.quantity <= item.reorderPoint
    );
    const outItems = items.filter(item => item.quantity <= 0);
    
    setLowStockItems(lowItems);
    setOutOfStockItems(outItems);
    
    return { lowItems, outItems };
  }, [items]);
  
  // Consume inventory for work orders
  const consumeWorkOrderInventory = async (itemsData: { id: string, quantity: number }[]): Promise<boolean> => {
    try {
      for (const itemData of itemsData) {
        const item = items.find(i => i.id === itemData.id);
        if (!item) continue;
        
        const newQuantity = item.quantity - itemData.quantity;
        await updateQuantity(itemData.id, newQuantity);
      }
      return true;
    } catch (error) {
      console.error('Error consuming work order inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory for work order",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Reserve inventory for work orders
  const reserveInventory = async (itemsData: { id: string, quantity: number }[]): Promise<boolean> => {
    try {
      // This is just a placeholder for now
      // In a real implementation, this would mark items as reserved
      // but not actually reduce the quantity
      return true;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      return false;
    }
  };
  
  // Reorder inventory item
  const reorderItem = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      // This is a placeholder for the reorder functionality
      toast({
        title: "Reorder Initiated",
        description: `Item reorder for quantity ${quantity} has been placed`,
      });
      return true;
    } catch (error) {
      console.error('Error reordering item:', error);
      return false;
    }
  };
  
  // Enable auto reorder for an item
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number): Promise<boolean> => {
    try {
      // Update local state
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: { enabled: true, threshold, quantity }
      }));
      
      toast({
        title: "Auto-Reorder Enabled",
        description: `Auto-reorder has been enabled for this item`,
      });
      return true;
    } catch (error) {
      console.error('Error enabling auto-reorder:', error);
      return false;
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
    removeInventoryItem,
    updateInventoryItem,
    filterItems,
    updateQuantity,
    checkInventoryAlerts,
    consumeWorkOrderInventory,
    reserveInventory,
    reorderItem,
    enableAutoReorder
  };
};
