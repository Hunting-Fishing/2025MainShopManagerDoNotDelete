
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Record an inventory transaction
 */
export const recordInventoryTransaction = async (
  inventoryItemId: string,
  quantity: number,
  transactionType: string,
  notes?: string,
  referenceId?: string,
  referenceType?: string
) => {
  try {
    const { data, error } = await supabase.from("inventory_transactions").insert({
      inventory_item_id: inventoryItemId,
      quantity,
      transaction_type: transactionType,
      notes,
      reference_id: referenceId,
      reference_type: referenceType,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error recording inventory transaction:", error);
    throw error;
  }
};

/**
 * Get transactions for a specific inventory item
 */
export const getItemTransactions = async (itemId: string) => {
  try {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*")
      .eq("inventory_item_id", itemId)
      .order("transaction_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching item transactions:", error);
    throw error;
  }
};

/**
 * Get all inventory transactions
 */
export const getInventoryTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    throw error;
  }
};

/**
 * Get transactions for a specific item
 */
export const getTransactionsForItem = async (itemId: string) => {
  return getItemTransactions(itemId);
};

/**
 * Create a new inventory transaction (alias for recordInventoryTransaction)
 */
export const createInventoryTransaction = recordInventoryTransaction;
