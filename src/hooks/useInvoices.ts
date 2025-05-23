
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  number: string;
  customer_id: string;
  customer: string;
  date: string;
  due_date: string;
  issue_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  subtotal: number;
  tax: number;
  tax_rate: number;
  total: number;
  created_at: string;
  items: any[];
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedData = (data || []).map(invoice => ({
        ...invoice,
        number: invoice.id,
        customer_id: invoice.customer_id || '',
        issue_date: invoice.date,
        tax_rate: 0.08,
        items: [],
      }));
      
      setInvoices(transformedData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return {
    invoices,
    loading,
    isLoading,
    error,
    refetch: fetchInvoices
  };
}
