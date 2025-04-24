import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { useToast } from '@/hooks/use-toast';
import { mapToWorkOrderInventoryItem } from '@/utils/inventoryAdapters';

export const useWorkOrderInventoryManager = (workOrderId: string) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<WorkOrderInventoryItem[]>([]);
  const { toast } = useToast();

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_inventory_items')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const mappedItems = mapToWorkOrderInventoryItem(data || []);
      setItems(mappedItems);
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
  }, [workOrderId, toast]);

  const addInventoryItem = async (item: Omit<WorkOrderInventoryItem, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_inventory_items')
        .insert([{
          work_order_id: workOrderId,
          ...item
        }])
        .select()
        .single();

      if (error) throw error;

      setItems(prevItems => [...prevItems, data]);
      
      toast({
        title: "Item Added",
        description: `${item.name} has been added to the work order`,
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

  const removeInventoryItem = async (itemId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('work_order_inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Removed",
        description: "Item has been removed from the work order",
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

  const updateInventoryItem = async (itemId: string, updates: Partial<WorkOrderInventoryItem>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_inventory_items')
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

  return {
    loading,
    items,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    fetchInventoryItems
  };
};
