import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceTemplate, InvoiceTemplateItem } from '@/types/invoice';
import { adaptInvoiceItemsToTemplateItems } from '@/components/invoices/templates/helpers';

// Save an invoice template
export async function saveInvoiceTemplate(
  template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>
): Promise<InvoiceTemplate> {
  try {
    // First save the template
    const { data: templateData, error: templateError } = await supabase
      .from('invoice_templates')
      .insert({
        name: template.name,
        description: template.description || '',
        default_notes: template.defaultNotes || '',
        default_due_date_days: template.defaultDueDateDays || 30,
        default_tax_rate: template.defaultTaxRate || 0,
        usage_count: 0
      })
      .select('*')
      .single();

    if (templateError) throw templateError;

    const templateId = templateData.id;

    // Then save all the template items
    const templateItems = template.defaultItems.map(item => ({
      template_id: templateId,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      hours: item.hours || false
    }));

    const { error: itemsError } = await supabase
      .from('invoice_template_items')
      .insert(templateItems);

    if (itemsError) throw itemsError;

    // Format and return the full template
    return {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      defaultNotes: templateData.default_notes,
      defaultDueDateDays: templateData.default_due_date_days,
      defaultTaxRate: templateData.default_tax_rate,
      createdAt: templateData.created_at,
      usageCount: templateData.usage_count,
      lastUsed: templateData.last_used,
      defaultItems: template.defaultItems.map(item => ({
        ...item,
        templateId: templateData.id,
        createdAt: new Date().toISOString()
      }))
    };
  } catch (error) {
    console.error('Error saving invoice template:', error);
    throw error;
  }
}

/**
 * Fetches all invoices for the current user/organization
 */
export async function fetchInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
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
        invoice_staff(*),
        payments(*)
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
export async function saveInvoice(invoice: Invoice, items: any[]) {
  // Start a transaction by creating a Supabase client
  // with explicit RPC call for transactions
  try {
    // If customer_id is not set in invoice but we have customer information,
    // try to look up the customer by name or create a new customer
    if (!invoice.customer_id && invoice.customer) {
      // Try to find the customer by name
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .or(`first_name.ilike.%${invoice.customer}%,last_name.ilike.%${invoice.customer}%`)
        .limit(1)
        .maybeSingle();
        
      if (existingCustomer) {
        invoice.customer_id = existingCustomer.id;
      }
    }
    
    // First save or update the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        id: invoice.id,
        customer: invoice.customer,
        customer_address: invoice.customerAddress,
        customer_email: invoice.customerEmail,
        customer_id: invoice.customer_id,
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
      
      // Then insert new ones, making sure to extract just the string name from the StaffMember objects
      const staffData = invoice.assignedStaff.map(staff => ({
        invoice_id: invoice.id,
        staff_name: typeof staff === 'string' ? staff : staff.name
      }));
      
      const { error: staffError } = await supabase
        .from('invoice_staff')
        .insert(staffData);
        
      if (staffError) {
        throw staffError;
      }
    }
    
    return invoiceData;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
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
