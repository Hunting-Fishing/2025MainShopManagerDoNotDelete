
import { useState, useEffect } from 'react';
import { Invoice } from "@/types/invoice";
import { supabase } from '@/lib/supabase';

export function useInvoiceData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (invoiceError) throw invoiceError;
      
      // For each invoice, fetch its items and assigned staff
      const invoicesWithDetails = await Promise.all(invoiceData.map(async (invoice) => {
        // Fetch invoice items
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id);
          
        if (itemsError) throw itemsError;
        
        // Fetch assigned staff
        const { data: staffData, error: staffError } = await supabase
          .from('invoice_staff')
          .select('staff_name')
          .eq('invoice_id', invoice.id);
          
        if (staffError) throw staffError;
        
        // Format to match Invoice type
        return {
          id: invoice.id,
          workOrderId: invoice.work_order_id || '',
          customer: invoice.customer || '',
          customerAddress: invoice.customer_address || '',
          customerEmail: invoice.customer_email || '',
          description: invoice.description || '',
          notes: invoice.notes || '',
          total: invoice.total || 0,
          subtotal: invoice.subtotal || 0,
          tax: invoice.tax || 0,
          status: invoice.status || 'draft',
          paymentMethod: invoice.payment_method || '',
          date: invoice.date || new Date().toISOString().split('T')[0],
          dueDate: invoice.due_date || '',
          createdBy: invoice.created_by || '',
          assignedStaff: staffData.map(staff => staff.staff_name),
          items: itemsData.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            price: item.price,
            hours: item.hours || false,
            total: item.total
          }))
        };
      }));
      
      setInvoices(invoicesWithDetails);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  return { invoices, isLoading, error, fetchInvoices };
}
