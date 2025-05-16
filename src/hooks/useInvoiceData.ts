import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceStatus } from '@/types/invoice';

export const useInvoiceData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        console.error("Error fetching invoices:", error);
        return;
      }

      if (data) {
        const transformedInvoices = data.map(transformInvoice);
        setInvoices(transformedInvoices);
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  // Inside the loadInvoices function
  const transformInvoice = (invoice: any): Invoice => {
    return {
      id: invoice.id,
      shop_id: invoice.shop_id || "",
      workOrderId: invoice.work_order_id || "",
      customer: invoice.customer,
      customerAddress: invoice.customer_address,
      customerEmail: invoice.customer_email,
      description: invoice.description,
      notes: invoice.notes,
      date: invoice.date,
      due_date: invoice.due_date,
      total: parseFloat(invoice.total || 0),
      subtotal: parseFloat(invoice.subtotal || 0),
      tax: parseFloat(invoice.tax || 0),
      status: invoice.status as InvoiceStatus,
      created_by: invoice.created_by,
      created_at: invoice.created_at,
      payment_method: invoice.payment_method,
      items: invoice.items ? invoice.items.map((item: any) => ({
        id: item.id,
        invoice_id: item.invoice_id,
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        hours: item.hours,
        total: Number(item.total),
        sku: item.sku,
        category: item.category
      })) : []
    };
  };

  const refreshInvoices = async () => {
    await loadInvoices();
  };

  return {
    invoices,
    loading,
    error,
    refreshInvoices
  };
};
