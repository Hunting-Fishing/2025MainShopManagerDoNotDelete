
import { useState } from "react";
import { 
  getInventoryTransactions, 
  getTransactionsForItem,
  createInventoryTransaction
} from "@/services/inventory/transactionService";
import { InventoryTransaction, CreateInventoryTransactionDto } from "@/types/inventory/transactions";
import { toast } from "@/hooks/use-toast";

export function useInventoryTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [itemTransactions, setItemTransactions] = useState<InventoryTransaction[]>([]);

  // Load all transactions
  const loadTransactions = async (): Promise<InventoryTransaction[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryTransactions();
      setTransactions(data);
      return data;
    } catch (err) {
      const errorMessage = "Failed to load inventory transactions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load transactions for a specific item
  const loadItemTransactions = async (itemId: string): Promise<InventoryTransaction[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactionsForItem(itemId);
      setItemTransactions(data);
      return data;
    } catch (err) {
      const errorMessage = `Failed to load transactions for item ${itemId}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new transaction
  const createTransaction = async (transaction: CreateInventoryTransactionDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInventoryTransaction(transaction);
      if (result) {
        toast({
          title: "Success",
          description: "Inventory transaction created successfully",
          variant: "default",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to create inventory transaction";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    transactions,
    itemTransactions,
    loadTransactions,
    loadItemTransactions,
    createTransaction,
  };
}
