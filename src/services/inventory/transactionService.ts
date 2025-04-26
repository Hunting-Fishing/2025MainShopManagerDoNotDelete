
import { supabase } from '@/lib/supabase';

// Get inventory transactions for an item
export async function getItemTransactions(itemId: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('inventory_item_id', itemId)
      .order('transaction_date', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    return [];
  }
}

// Record an inventory transaction
export async function recordTransaction(
  itemId: string, 
  quantity: number, 
  transactionType: string,
  notes?: string,
  referenceId?: string,
  referenceType?: string
) {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        quantity,
        transaction_type: transactionType,
        notes,
        reference_id: referenceId,
        reference_type: referenceType
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error recording inventory transaction:', error);
    return false;
  }
}
