
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number; // Fixed: Use correct column name
  minimum_stock?: number;
  unit_price?: number;
  supplier?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export class InventoryService {
  async getAllItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllItems:', error);
      throw error;
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('quantity', 'lt', 'minimum_stock')
        .order('quantity', { ascending: true });

      if (error) {
        console.error('Error fetching low stock items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLowStockItems:', error);
      throw error;
    }
  }

  async updateQuantity(itemId: string, newQuantity: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating inventory quantity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      throw error;
    }
  }
}
