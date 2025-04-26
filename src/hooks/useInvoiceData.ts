import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Invoice, StaffMember } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';

export function useInvoiceData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch all invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) {
        throw invoicesError;
      }

      // For each invoice, fetch its items and staff
      const invoicesWithDetails = await Promise.all(
        invoicesData.map(async (invoice) => {
          // Fetch invoice items
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (itemsError) {
            throw itemsError;
          }

          // Fetch assigned staff
          const { data: staffData, error: staffError } = await supabase
            .from('invoice_staff')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (staffError) {
            throw staffError;
          }

          // Format the invoice object according to our type
          const formattedInvoice: Invoice = {
            id: invoice.id,
            workOrderId: invoice.work_order_id || '',
            customer: invoice.customer || 'Unknown Customer',
            customerAddress: invoice.customer_address || '',
            customerEmail: invoice.customer_email || '',
            description: invoice.description || '',
            notes: invoice.notes || '',
            total: Number(invoice.total) || 0,
            subtotal: Number(invoice.subtotal) || 0,
            tax: Number(invoice.tax) || 0,
            // Type-cast the status to make sure it conforms to InvoiceStatus
            status: (invoice.status as Invoice['status']) || 'draft',
            paymentMethod: invoice.payment_method || '',
            date: invoice.date || new Date().toISOString().split('T')[0],
            due_date: invoice.due_date || '', // Changed from dueDate to due_date
            createdBy: invoice.created_by || '',
            assignedStaff: staffData?.map((staff: any): StaffMember => ({
              id: staff.id || crypto.randomUUID(),
              name: staff.staff_name,
              role: staff.role || ''
            })) || [],
            items: itemsData?.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              quantity: Number(item.quantity),
              price: Number(item.price),
              hours: item.hours || false,
              total: Number(item.total),
              sku: item.sku || '',
              category: item.category || ''
            })) || []
          };

          return formattedInvoice;
        })
      );

      setInvoices(invoicesWithDetails);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { invoices, isLoading, error, fetchInvoices };
}
