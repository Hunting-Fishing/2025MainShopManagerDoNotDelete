
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';

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
        number: invoice.number || invoice.id,
        customer_id: invoice.customer_id || '',
        customer_email: invoice.customer_email || '',
        customer_address: invoice.customer_address || '',
        issue_date: invoice.issue_date || invoice.date,
        tax_rate: invoice.tax_rate || 0.08,
        items: invoice.items || [],
        notes: invoice.notes || '',
        description: invoice.description || '',
        payment_method: invoice.payment_method || '',
        work_order_id: invoice.work_order_id || '',
        assignedStaff: invoice.assignedStaff || [],
        created_by: invoice.created_by || '',
        updated_at: invoice.updated_at || invoice.created_at,
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
