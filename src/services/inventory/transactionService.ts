
import { supabase } from "@/lib/supabase";
import { InventoryTransaction, CreateInventoryTransactionDto } from "@/types/inventory/transactions";
import { handleApiError } from "@/utils/errorHandling";
import { updateInventoryQuantity } from "./crudService";

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*, inventory_items(name, sku)")
      .order("transaction_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch inventory transactions");
    return [];
  }
}

export async function getTransactionsForItem(itemId: string): Promise<InventoryTransaction[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*")
      .eq("inventory_item_id", itemId)
      .order("transaction_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleApiError(error, `Failed to fetch transactions for item ${itemId}`);
    return [];
  }
}

export async function createInventoryTransaction(
  transaction: CreateInventoryTransactionDto
): Promise<InventoryTransaction | null> {
  try {
    // First, update the inventory item quantity
    let quantityChange = transaction.quantity;
    
    // For outgoing transactions like sales, make the quantity negative
    if (
      transaction.transaction_type === "sale" || 
      transaction.transaction_type === "write-off" ||
      (transaction.transaction_type === "adjustment" && transaction.quantity < 0)
    ) {
      quantityChange = -Math.abs(quantityChange);
    }
    
    // Update the inventory quantity
    await updateInventoryQuantity(transaction.inventory_item_id, quantityChange);

    // Create the transaction record
    const { data, error } = await supabase
      .from("inventory_transactions")
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, "Failed to create inventory transaction");
    return null;
  }
}

export async function getInventoryItemHistory(itemId: string, limit = 10): Promise<InventoryTransaction[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*")
      .eq("inventory_item_id", itemId)
      .order("transaction_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleApiError(error, `Failed to fetch history for item ${itemId}`);
    return [];
  }
}
