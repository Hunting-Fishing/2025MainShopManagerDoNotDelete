
import { supabase } from "@/lib/supabase";
import { LoyaltyTransaction } from "@/types/loyalty";

export const createLoyaltyTransaction = async (transaction: {
  customer_id: string;
  points: number;
  transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust';
  description?: string;
  reference_id?: string;
  reference_type?: string;
}): Promise<LoyaltyTransaction> => {
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("Error creating loyalty transaction:", error);
    throw error;
  }

  return data as LoyaltyTransaction;
};

export const getCustomerTransactions = async (customerId: string): Promise<LoyaltyTransaction[]> => {
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer transactions:", error);
    throw error;
  }

  return data as LoyaltyTransaction[];
};
