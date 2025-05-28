
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
        number: invoice.number || invoice.id, // Use existing number or fallback to id
        customer_id: invoice.customer_id || '',
        customer_email: invoice.customer_email || '',
        customer_address: invoice.customer_address || '',
        issue_date: invoice.issue_date || invoice.date, // Use existing issue_date or fallback to date
        tax_rate: invoice.tax_rate || 0.08, // Use existing tax_rate or default
        items: invoice.items || [], // Use existing items or default to empty array
        notes: invoice.notes || '',
        description: invoice.description || '',
        payment_method: invoice.payment_method || '',
        work_order_id: invoice.work_order_id || '',
        assignedStaff: invoice.assignedStaff || [], // Use existing assignedStaff or default to empty array
        created_by: invoice.created_by || '',
        updated_at: invoice.updated_at || invoice.created_at, // Use existing updated_at or fallback to created_at
        status: (['pending', 'draft', 'paid', 'overdue', 'cancelled'].includes(invoice.status) 
          ? invoice.status 
          : 'pending') as 'pending' | 'draft' | 'paid' | 'overdue' | 'cancelled'
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
