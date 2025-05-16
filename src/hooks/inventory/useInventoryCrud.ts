
import { useState } from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { supabase } from '@/lib/supabase';

export function useInventoryCrud() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);

  const fetchItems = async (): Promise<InventoryItemExtended[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');
        
      if (error) throw error;
      
      const formattedItems = data as InventoryItemExtended[];
      setItems(formattedItems);
      return formattedItems;
    } catch (error: any) {
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select()
        .single();
        
      if (error) throw error;
      
      const newItem = data as InventoryItemExtended;
      setItems(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedItem = data as InventoryItemExtended;
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number): Promise<InventoryItemExtended> => {
    return updateItem(id, { quantity: newQuantity });
  };

  const removeItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      return true;
    } catch (error: any) {
      setError(error);
      throw error;
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
    removeItem 
  };
}
