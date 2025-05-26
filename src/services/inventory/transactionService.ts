
import { supabase } from "@/integrations/supabase/client";

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
  performed_by?: string;
}

/**
 * Record an inventory transaction
 */
export const recordInventoryTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>): Promise<InventoryTransaction | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert(transaction)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording inventory transaction:', error);
    return null;
  }
};

/**
 * Get transactions for a specific item
 */
export const getItemTransactions = async (itemId: string): Promise<InventoryTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('inventory_item_id', itemId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    return [];
  }
};

/**
 * Get all inventory transactions
 */
export const getInventoryTransactions = async (): Promise<InventoryTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return [];
  }
};

/**
 * Alias for getItemTransactions for backward compatibility
 */
export const getTransactionsForItem = getItemTransactions;

/**
 * Create inventory transaction (alias for recordInventoryTransaction)
 */
export const createInventoryTransaction = recordInventoryTransaction;
