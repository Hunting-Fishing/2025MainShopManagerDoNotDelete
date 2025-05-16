
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { formatApiInvoice, formatInvoiceForApi } from "@/utils/invoiceUtils";

// Helper to generate a unique invoice ID
const generateInvoiceId = () => {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Get all invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }

  return (data || []).map(formatApiInvoice);
};

// Get a single invoice by ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, related_work_order:work_order_id(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw error;
  }

  return formatApiInvoice(data);
};

// Get invoice items by invoice ID
export const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId);

  if (error) {
    console.error(`Error fetching invoice items for invoice ${invoiceId}:`, error);
    throw error;
  }

  return data || [];
};

// Create a new invoice
export const createInvoice = async (invoice: Partial<Invoice>, items?: InvoiceItem[]): Promise<Invoice> => {
  // Generate a unique invoice ID if not provided
  const id = invoice.id || generateInvoiceId();
  
  // Prepare invoice data for API
  const invoiceData = {
    ...formatInvoiceForApi(invoice as Invoice),
    id,
    created_at: new Date().toISOString(),
  };

  // Insert invoice
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }

  // Insert items if provided
  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: id
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      throw itemsError;
    }
  }

  return formatApiInvoice(data);
};

// Update an existing invoice
export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
  // Prepare update data with proper field names
  const updateData = {
    ...formatInvoiceForApi(invoice as Invoice),
    last_updated_by: invoice.lastUpdatedBy,
    last_updated_at: invoice.lastUpdatedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error;
  }

  return formatApiInvoice(data);
};

// Delete an invoice
export const deleteInvoice = async (id: string): Promise<void> => {
  // First delete associated items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', id);

  if (itemsError) {
    console.error(`Error deleting invoice items for invoice ${id}:`, itemsError);
    throw itemsError;
  }

  // Then delete the invoice
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw error;
  }
};

// Get all invoice templates
export const getInvoiceTemplates = async (): Promise<InvoiceTemplate[]> => {
  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .order('name');

  if (error) {
    console.error("Error fetching invoice templates:", error);
    throw error;
  }

  return data || [];
};

// Create a new invoice template
export const createInvoiceTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usageCount'>): Promise<InvoiceTemplate> => {
  const templateData = {
    name: template.name,
    description: template.description,
    default_tax_rate: template.default_tax_rate,
    default_notes: template.default_notes,
    default_due_date_days: template.default_due_date_days,
    usage_count: 0,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('invoice_templates')
    .insert(templateData)
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice template:", error);
    throw error;
  }

  // Insert template items if provided
  if (template.items && template.items.length > 0) {
    const itemsWithTemplateId = template.items.map(item => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      hours: item.hours,
      template_id: data.id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_template_items')
      .insert(itemsWithTemplateId);

    if (itemsError) {
      console.error("Error creating template items:", itemsError);
      throw itemsError;
    }
  }

  return data;
};

// Update invoice template usage count
export const updateInvoiceTemplateUsage = async (templateId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('increment_template_usage', {
      template_id: templateId,
      update_timestamp: new Date().toISOString()
    });

  if (error) {
    console.error(`Error updating template usage for ${templateId}:`, error);
    throw error;
  }
};
