
import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";

// Function to convert API invoice to our Invoice type
export const formatApiInvoice = (apiInvoice: any): Invoice => {
  return {
    id: apiInvoice.id,
    number: apiInvoice.number,
    customer: apiInvoice.customer,
    customer_id: apiInvoice.customer_id,
    customer_email: apiInvoice.customer_email,
    customer_address: apiInvoice.customer_address,
    issue_date: apiInvoice.date || apiInvoice.issue_date || new Date().toISOString(),
    date: apiInvoice.date,
    due_date: apiInvoice.due_date,
    status: apiInvoice.status,
    subtotal: Number(apiInvoice.subtotal) || 0,
    tax_rate: Number(apiInvoice.tax_rate) || 0,
    tax: Number(apiInvoice.tax) || 0,
    total: Number(apiInvoice.total) || 0,
    notes: apiInvoice.notes,
    work_order_id: apiInvoice.work_order_id,
    created_by: apiInvoice.created_by,
    created_at: apiInvoice.created_at,
    updated_at: apiInvoice.updated_at,
    payment_method: apiInvoice.payment_method,
    assignedStaff: apiInvoice.assignedStaff || [],
    items: apiInvoice.items || []
  };
};

// Get all invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map the invoices to our Invoice type
    return data.map(formatApiInvoice);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Get invoice by ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*), assignedStaff:invoice_staff(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return formatApiInvoice(data);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Create new invoice
export const createInvoice = async (invoiceData: Partial<Invoice>, items: InvoiceItem[]): Promise<Invoice> => {
  try {
    // Insert the invoice first
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();
    
    if (invoiceError) throw invoiceError;
    
    // Then insert all the invoice items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        invoice_id: invoice.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        hours: !!item.hours
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }
    
    // Return the created invoice
    return formatApiInvoice(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Update existing invoice
export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>, items: InvoiceItem[]): Promise<Invoice> => {
  try {
    // Update the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        ...invoiceData,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (invoiceError) throw invoiceError;
    
    // Delete existing items
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);
    
    // Insert new items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        invoice_id: id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        hours: !!item.hours
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }
    
    // Return the updated invoice
    return getInvoiceById(id);
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

// Delete invoice
export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    // Delete invoice items first (due to foreign key constraint)
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);
    
    if (itemsError) throw itemsError;
    
    // Then delete the invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (invoiceError) throw invoiceError;
    
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

// Get invoice templates
export const getInvoiceTemplates = async (): Promise<InvoiceTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data as InvoiceTemplate[];
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    throw error;
  }
};

// Get invoice template by ID
export const getInvoiceTemplateById = async (id: string): Promise<InvoiceTemplate> => {
  try {
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data as InvoiceTemplate;
  } catch (error) {
    console.error('Error fetching invoice template:', error);
    throw error;
  }
};

// Create invoice template
export const createInvoiceTemplate = async (templateData: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>): Promise<InvoiceTemplate> => {
  try {
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert([templateData])
      .select()
      .single();
    
    if (error) throw error;
    
    return data as InvoiceTemplate;
  } catch (error) {
    console.error('Error creating invoice template:', error);
    throw error;
  }
};

// Update invoice template usage count
export const updateTemplateUsage = async (id: string): Promise<void> => {
  try {
    await supabase.rpc('increment_template_usage', { template_id: id });
  } catch (error) {
    console.error('Error updating template usage count:', error);
    throw error;
  }
};
