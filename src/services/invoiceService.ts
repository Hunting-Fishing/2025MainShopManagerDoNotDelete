
import { supabase } from '@/lib/supabase';
import { Invoice } from '@/types/invoice';

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data || [];
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }

    return data;
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        customer: invoice.customer,
        date: invoice.date,
        due_date: invoice.due_date,
        status: invoice.status,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        customer_id: invoice.customer_id,
        customer_email: invoice.customer_email,
        customer_address: invoice.customer_address,
        notes: invoice.notes,
        payment_method: invoice.payment_method,
        work_order_id: invoice.work_order_id,
        template_id: invoice.template_id,
        description: invoice.description,
        created_by: invoice.created_by
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }

    return data;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    // Only include valid database fields in the update
    const validUpdates: any = {};
    
    if (updates.customer !== undefined) validUpdates.customer = updates.customer;
    if (updates.date !== undefined) validUpdates.date = updates.date;
    if (updates.due_date !== undefined) validUpdates.due_date = updates.due_date;
    if (updates.status !== undefined) validUpdates.status = updates.status;
    if (updates.subtotal !== undefined) validUpdates.subtotal = updates.subtotal;
    if (updates.tax !== undefined) validUpdates.tax = updates.tax;
    if (updates.total !== undefined) validUpdates.total = updates.total;
    if (updates.customer_id !== undefined) validUpdates.customer_id = updates.customer_id;
    if (updates.customer_email !== undefined) validUpdates.customer_email = updates.customer_email;
    if (updates.customer_address !== undefined) validUpdates.customer_address = updates.customer_address;
    if (updates.notes !== undefined) validUpdates.notes = updates.notes;
    if (updates.payment_method !== undefined) validUpdates.payment_method = updates.payment_method;
    if (updates.work_order_id !== undefined) validUpdates.work_order_id = updates.work_order_id;
    if (updates.template_id !== undefined) validUpdates.template_id = updates.template_id;
    if (updates.description !== undefined) validUpdates.description = updates.description;

    const { data, error } = await supabase
      .from('invoices')
      .update(validUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update invoice: ${error.message}`);
    }

    return data;
  },

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  }
};
