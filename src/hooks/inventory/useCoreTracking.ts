
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CoreTransaction {
  id: string;
  inventoryItemId: string;
  coreId: string;
  type: 'charge' | 'return';
  amount: number;
  date: string;
  notes?: string;
}

export interface CoreTransactionSummary {
  transactions: CoreTransaction[];
  chargedAmount: number;
  returnedAmount: number;
  balance: number;
}

export function useCoreTracking(itemId: string) {
  const [loading, setLoading] = useState(false);
  const [coreTransactions, setCoreTransactions] = useState<CoreTransactionSummary | null>(null);

  const fetchCoreTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_core_transactions')
        .select('*')
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to client format
      const transformedData: CoreTransaction[] = data.map(item => ({
        id: item.id,
        inventoryItemId: item.inventory_item_id,
        coreId: item.core_id,
        type: item.transaction_type,
        amount: item.amount,
        date: item.created_at,
        notes: item.notes
      }));
      
      // Calculate totals
      let chargedAmount = 0;
      let returnedAmount = 0;
      
      transformedData.forEach(transaction => {
        if (transaction.type === 'charge') {
          chargedAmount += transaction.amount;
        } else {
          returnedAmount += transaction.amount;
        }
      });
      
      setCoreTransactions({
        transactions: transformedData,
        chargedAmount,
        returnedAmount,
        balance: chargedAmount - returnedAmount
      });
      
    } catch (err) {
      console.error('Error fetching core transactions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load core transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (itemId) {
      fetchCoreTransactions();
    }
  }, [itemId]);
  
  const recordCoreCharge = async (coreId: string, amount: number, notes?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_core_transactions')
        .insert({
          inventory_item_id: itemId,
          core_id: coreId,
          transaction_type: 'charge',
          amount: amount,
          notes: notes
        });
        
      if (error) throw error;
      
      toast({
        title: 'Core Charge Recorded',
        description: `Core charge of $${amount.toFixed(2)} has been recorded`,
        variant: 'default'
      });
      
      await fetchCoreTransactions();
      
    } catch (err) {
      console.error('Error recording core charge:', err);
      toast({
        title: 'Error',
        description: 'Failed to record core charge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const recordCoreReturn = async (coreId: string, amount: number, notes?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_core_transactions')
        .insert({
          inventory_item_id: itemId,
          core_id: coreId,
          transaction_type: 'return',
          amount: amount,
          notes: notes
        });
        
      if (error) throw error;
      
      toast({
        title: 'Core Return Recorded',
        description: `Core return of $${amount.toFixed(2)} has been recorded`,
        variant: 'default'
      });
      
      await fetchCoreTransactions();
      
    } catch (err) {
      console.error('Error recording core return:', err);
      toast({
        title: 'Error',
        description: 'Failed to record core return',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    coreTransactions,
    recordCoreCharge,
    recordCoreReturn,
    refreshTransactions: fetchCoreTransactions
  };
}
