
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { updateInventoryQuantity } from './crudService';

// Record an inventory transaction and update quantity
export const recordInventoryTransaction = async (
  itemId: string,
  quantity: number, 
  type: 'addition' | 'reduction' | 'adjustment', 
  referenceId?: string, 
  notes?: string
): Promise<boolean> => {
  // Start a transaction
  try {
    // 1. Record the transaction
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        quantity: quantity,
        transaction_date: new Date().toISOString(),
        transaction_type: type,
        reference_id: referenceId || null,
        reference_type: referenceId ? 'work_order' : null,
        notes: notes || null
      });
      
    if (transactionError) throw transactionError;
    
    // 2. Get current quantity
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', itemId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 3. Calculate new quantity
    let newQuantity = currentItem.quantity;
    if (type === 'addition') {
      newQuantity += quantity;
    } else if (type === 'reduction') {
      newQuantity -= quantity;
    } else if (type === 'adjustment') {
      newQuantity = quantity; // Direct set for adjustments
    }
    
    // 4. Update the inventory quantity
    await updateInventoryQuantity(itemId, newQuantity);
    
    return true;
  } catch (error) {
    console.error('Error in inventory transaction:', error);
    return false;
  }
};

// Get all transactions for an item
export const getItemTransactions = async (itemId: string) => {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('transaction_date', { ascending: false });
    
  if (error) {
    console.error('Error fetching item transactions:', error);
    throw error;
  }
  
  return data;
};
