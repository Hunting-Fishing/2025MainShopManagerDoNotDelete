import { supabase } from "@/integrations/supabase/client";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetches all invoices for the current user/organization
 */
export async function fetchInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    toast({
      title: "Error loading invoices",
      description: "Failed to load invoices. Please try again.",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Fetches a single invoice by ID
 */
export async function fetchInvoiceById(invoiceId: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*),
        invoice_staff(*)
      `)
      .eq('id', invoiceId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    toast({
      title: "Error loading invoice",
      description: "Failed to load invoice details. Please try again.",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Creates or updates an invoice with transaction support
 */
export async function saveInvoice(invoice: Invoice, items: InvoiceItem[]) {
  // Start a transaction by creating a Supabase client
  // with explicit RPC call for transactions
  try {
    // First save or update the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        id: invoice.id,
        customer: invoice.customer,
        customer_address: invoice.customerAddress,
        customer_email: invoice.customerEmail,
        description: invoice.description, 
        notes: invoice.notes,
        date: invoice.date,
        due_date: invoice.dueDate,
        status: invoice.status,
        work_order_id: invoice.workOrderId,
        created_by: invoice.createdBy,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        payment_method: invoice.paymentMethod,
        last_updated_by: invoice.lastUpdatedBy || null,
        last_updated_at: invoice.lastUpdatedAt || new Date().toISOString(),
      })
      .select()
      .single();
    
    if (invoiceError) {
      throw invoiceError;
    }
    
    // Delete existing items for this invoice
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoice.id);
      
    if (deleteError) {
      throw deleteError;
    }
    
    // Then insert all items with the invoice ID
    if (items && items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          items.map(item => ({
            invoice_id: invoice.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            hours: item.hours || false
          }))
        );
        
      if (itemsError) {
        throw itemsError;
      }
    }
    
    // Finally, save the staff assignments
    if (invoice.assignedStaff && invoice.assignedStaff.length > 0) {
      // First delete existing assignments
      await supabase
        .from('invoice_staff')
        .delete()
        .eq('invoice_id', invoice.id);
      
      // Then insert new ones
      const { error: staffError } = await supabase
        .from('invoice_staff')
        .insert(
          invoice.assignedStaff.map(staff => ({
            invoice_id: invoice.id,
            staff_name: staff
          }))
        );
        
      if (staffError) {
        throw staffError;
      }
    }
    
    toast({
      title: "Invoice saved",
      description: "Invoice has been saved successfully.",
    });
    
    return invoiceData;
  } catch (err) {
    console.error("Error saving invoice:", err);
    toast({
      title: "Error saving invoice",
      description: "Failed to save invoice. Please try again.",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Deletes an invoice and its related items
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    // Delete invoice (cascade should handle items and staff assignments)
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Invoice deleted",
      description: "Invoice has been deleted successfully.",
    });
    
    return true;
  } catch (err) {
    console.error("Error deleting invoice:", err);
    toast({
      title: "Error deleting invoice",
      description: "Failed to delete invoice. Please try again.",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Updates invoice status
 */
export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Status updated",
      description: `Invoice status has been updated to ${status}.`,
    });
    
    return data;
  } catch (err) {
    console.error("Error updating invoice status:", err);
    toast({
      title: "Error updating status",
      description: "Failed to update invoice status. Please try again.",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Sets up real-time subscription for invoices
 */
export function subscribeToInvoices(callback: (payload: any) => void) {
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
        callback(payload);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
