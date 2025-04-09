
import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useInvoiceData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedInvoices = data.map(invoice => {
          return {
            id: invoice.id,
            customer: invoice.customer,
            customerAddress: invoice.customer_address,
            customerEmail: invoice.customer_email,
            description: invoice.description,
            notes: invoice.notes,
            status: invoice.status as "draft" | "pending" | "paid" | "overdue" | "cancelled",
            date: invoice.date,
            dueDate: invoice.due_date,
            total: invoice.total,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            workOrderId: invoice.work_order_id,
            createdBy: invoice.created_by,
            paymentMethod: invoice.payment_method || '', // Ensure paymentMethod is always defined
            customer_id: invoice.customer_id,
            items: invoice.invoice_items || [],
            assignedStaff: [] // Add the missing assignedStaff property
          } as Invoice;
        });

        setInvoices(formattedInvoices);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    if (isRealTimeEnabled) {
      const channel = supabase
        .channel('invoice_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices'
          },
          (payload) => {
            console.log('Invoice change received:', payload);
            fetchInvoices();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isRealTimeEnabled]);

  const saveInvoice = async ({ invoice, items }: { invoice: Invoice, items: any[] }) => {
    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          id: invoice.id,
          work_order_id: invoice.workOrderId || null,
          customer: invoice.customer,
          customer_email: invoice.customerEmail,
          customer_address: invoice.customerAddress,
          description: invoice.description,
          notes: invoice.notes,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          status: invoice.status,
          date: invoice.date,
          due_date: invoice.dueDate,
          created_by: invoice.createdBy,
          created_at: new Date().toISOString()
        });

      if (invoiceError) throw invoiceError;

      if (items && items.length > 0) {
        const invoiceItems = items.map(item => ({
          invoice_id: invoice.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      await fetchInvoices();

      return { success: true };
    } catch (error) {
      console.error('Error saving invoice:', error);
      return { success: false, error };
    }
  };

  const refetch = async () => {
    await fetchInvoices();
  };

  const isError = error !== null;

  return {
    invoices,
    isLoading,
    error,
    isError,
    saveInvoice,
    refetch,
    isRealTimeEnabled,
    setIsRealTimeEnabled
  };
}
