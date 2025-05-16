
import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceItem, InvoiceTemplate } from '@/types/invoice';
import { formatApiInvoice, formatInvoiceForApi } from '@/utils/invoiceUtils';

// Get a list of all invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map API response to our Invoice type
    return data.map(invoice => formatApiInvoice(invoice));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Get a single invoice by ID
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  try {
    // Get invoice data
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
      
    if (invoiceError) throw invoiceError;
    
    // Get invoice items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);
      
    if (itemsError) throw itemsError;
    
    // Get staff assignments
    const { data: staffData, error: staffError } = await supabase
      .from('invoice_staff')
      .select('*')
      .eq('invoice_id', id);
      
    if (staffError) throw staffError;
    
    // Format staff data
    const assignedStaff = staffData ? staffData.map(staff => ({
      id: staff.id,
      name: staff.staff_name
    })) : [];
    
    // Return combined data
    const invoiceWithItems = {
      ...invoiceData,
      items: itemsData || [],
      assignedStaff
    };
    
    return formatApiInvoice(invoiceWithItems);
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    return null;
  }
};

// Create a new invoice
export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  try {
    // Extract items and staff for separate insertion
    const { items = [], assignedStaff = [], ...invoiceData } = invoice;
    
    // Format for API
    const formattedInvoice = formatInvoiceForApi(invoiceData as Invoice);
    
    // Insert invoice
    const { data: createdInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...formattedInvoice,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (invoiceError) throw invoiceError;
    
    // Insert items if any
    if (items.length > 0) {
      const formattedItems = items.map(item => ({
        invoice_id: createdInvoice.id,
        id: item.id,
        description: item.description || '',
        quantity: Number(item.quantity),
        price: Number(item.price),
        hours: item.hours || false,
        category: item.category || '',
        sku: item.sku || '',
        name: item.name || '',
        total: Number(item.quantity) * Number(item.price)
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(formattedItems);
        
      if (itemsError) throw itemsError;
    }
    
    // Insert staff assignments if any
    if (assignedStaff.length > 0) {
      const formattedStaff = assignedStaff.map(staff => ({
        invoice_id: createdInvoice.id,
        staff_name: staff.name
      }));
      
      const { error: staffError } = await supabase
        .from('invoice_staff')
        .insert(formattedStaff);
        
      if (staffError) throw staffError;
    }
    
    // Return complete invoice with items and staff
    return {
      ...formatApiInvoice(createdInvoice),
      items,
      assignedStaff
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Update an existing invoice
export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { items, assignedStaff, ...invoiceUpdates } = updates;
    
    // Update invoice data
    const formattedUpdates = formatInvoiceForApi(invoiceUpdates as Invoice);
    
    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        ...formattedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (invoiceError) throw invoiceError;
    
    // Update items if included in updates
    if (items) {
      // First delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);
        
      if (deleteError) throw deleteError;
      
      // Then insert new items
      if (items.length > 0) {
        const formattedItems = items.map(item => ({
          invoice_id: id,
          id: item.id,
          name: item.name || '',
          description: item.description || '',
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.quantity) * Number(item.price),
          hours: item.hours || false,
          category: item.category || '',
          sku: item.sku || ''
        }));
        
        const { error: insertError } = await supabase
          .from('invoice_items')
          .upsert(formattedItems);
          
        if (insertError) throw insertError;
      }
    }
    
    // Update staff assignments if included in updates
    if (assignedStaff) {
      // First delete existing assignments
      const { error: deleteStaffError } = await supabase
        .from('invoice_staff')
        .delete()
        .eq('invoice_id', id);
        
      if (deleteStaffError) throw deleteStaffError;
      
      // Then insert new assignments
      if (assignedStaff.length > 0) {
        const formattedStaff = assignedStaff.map(staff => ({
          invoice_id: id,
          staff_name: staff.name
        }));
        
        const { error: insertStaffError } = await supabase
          .from('invoice_staff')
          .insert(formattedStaff);
          
        if (insertStaffError) throw insertStaffError;
      }
    }
    
    // Get updated invoice with items and staff
    return getInvoiceById(id) as Promise<Invoice>;
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    // Delete related records first
    await Promise.all([
      supabase.from('invoice_items').delete().eq('invoice_id', id),
      supabase.from('invoice_staff').delete().eq('invoice_id', id)
    ]);
    
    // Then delete the invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    return false;
  }
};

// Save an invoice template
export const saveInvoiceTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>): Promise<InvoiceTemplate> => {
  try {
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        name: template.name,
        description: template.description,
        default_tax_rate: template.default_tax_rate || 0,
        default_due_date_days: template.default_due_date_days || 30,
        default_notes: template.default_notes || '',
        last_used: null,
        usage_count: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Insert template items if provided
    if (template.invoice_template_items && template.invoice_template_items.length > 0) {
      const templateItems = template.invoice_template_items.map(item => ({
        template_id: data.id,
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        hours: item.hours || false,
        sku: item.sku || '',
        category: item.category || ''
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_template_items')
        .insert(templateItems);
        
      if (itemsError) throw itemsError;
    }
    
    return data as InvoiceTemplate;
  } catch (error) {
    console.error('Error saving invoice template:', error);
    throw error;
  }
};

// Get all invoice templates
export const getInvoiceTemplates = async (): Promise<InvoiceTemplate[]> => {
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('invoice_templates')
      .select('*')
      .order('name');
      
    if (templatesError) throw templatesError;
    
    // Get template items for each template
    const templatesWithItems = await Promise.all(templates.map(async (template) => {
      const { data: items, error: itemsError } = await supabase
        .from('invoice_template_items')
        .select('*')
        .eq('template_id', template.id);
        
      if (itemsError) throw itemsError;
      
      return {
        ...template,
        invoice_template_items: items || []
      };
    }));
    
    return templatesWithItems;
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    return [];
  }
};
