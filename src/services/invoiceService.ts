import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem, StaffMember } from "@/types/invoice";

// Helper function to format an API invoice object
export const formatApiInvoice = (invoice: any): Invoice => {
  return {
    id: invoice.id,
    number: invoice.number || invoice.id.substring(0, 8).toUpperCase(),
    customer: invoice.customer || "",
    customer_id: invoice.customer_id,
    customer_email: invoice.customer_email || "",
    customer_address: invoice.customer_address || "",
    date: invoice.date || invoice.issue_date || new Date().toISOString(),
    due_date: invoice.due_date || "",
    status: invoice.status || "draft",
    subtotal: Number(invoice.subtotal) || 0,
    tax_rate: Number(invoice.tax_rate) || 0,
    tax: Number(invoice.tax) || 0,
    total: Number(invoice.total) || 0,
    notes: invoice.notes || "",
    work_order_id: invoice.work_order_id || "",
    description: invoice.description || "",
    payment_method: invoice.payment_method || "",
    created_by: invoice.created_by || "",
    created_at: invoice.created_at || new Date().toISOString(),
    updated_at: invoice.updated_at || new Date().toISOString(),
    assignedStaff: invoice.assignedStaff || [],
    items: invoice.items || [],
  };
};

// Helper function to format an invoice for API submission
export const formatInvoiceForApi = (invoice: Invoice): any => {
  return {
    id: invoice.id,
    customer: invoice.customer,
    customer_id: invoice.customer_id,
    customer_email: invoice.customer_email,
    customer_address: invoice.customer_address,
    issue_date: invoice.date,
    due_date: invoice.due_date,
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    tax_rate: Number(invoice.tax_rate),
    tax: Number(invoice.tax),
    total: Number(invoice.total),
    notes: invoice.notes,
    work_order_id: invoice.work_order_id,
    description: invoice.description,
    payment_method: invoice.payment_method,
    created_by: invoice.created_by,
    created_at: invoice.created_at,
    updated_at: new Date().toISOString(),
  };
};

export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase.from("invoices").select("*");

    if (error) {
      throw error;
    }

    // Fetch items for each invoice
    const invoicesWithItems = await Promise.all(
      data.map(async (invoice) => {
        const { data: items, error: itemsError } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", invoice.id);

        if (itemsError) {
          console.error("Error fetching invoice items:", itemsError);
          return formatApiInvoice(invoice);
        }

        // Fetch assigned staff
        const { data: staff, error: staffError } = await supabase
          .from("invoice_staff")
          .select("*")
          .eq("invoice_id", invoice.id);

        if (staffError) {
          console.error("Error fetching invoice staff:", staffError);
          return formatApiInvoice({ ...invoice, items });
        }

        return formatApiInvoice({
          ...invoice,
          items,
          assignedStaff: staff || [],
        });
      })
    );

    return invoicesWithItems;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  try {
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    // Fetch items for the invoice
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
    }

    // Fetch assigned staff
    const { data: staff, error: staffError } = await supabase
      .from("invoice_staff")
      .select("*")
      .eq("invoice_id", id);

    if (staffError) {
      console.error("Error fetching invoice staff:", staffError);
    }

    return formatApiInvoice({
      ...invoice,
      items: items || [],
      assignedStaff: staff || [],
    });
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    return null;
  }
};

export const createInvoice = async (invoice: Invoice): Promise<Invoice> => {
  try {
    // Format the invoice for the API
    const apiInvoice = formatInvoiceForApi(invoice);

    // Insert the invoice
    const { data, error } = await supabase
      .from("invoices")
      .insert([apiInvoice])
      .select();

    if (error) {
      throw error;
    }

    // Insert the invoice items
    if (invoice.items && invoice.items.length > 0) {
      const formattedItems = invoice.items.map((item) => ({
        invoice_id: invoice.id,
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        hours: item.hours || false,
        category: item.category || null,
        sku: item.sku || null,
        name: item.name || null,
        total: item.quantity * item.price,
      }));

      await supabase.from("invoice_items").insert(formattedItems);
    }

    // Insert assigned staff
    if (invoice.assignedStaff && invoice.assignedStaff.length > 0) {
      const formattedStaff = invoice.assignedStaff.map((staff) => ({
        invoice_id: invoice.id,
        staff_name: staff.name,
      }));

      await supabase.from("invoice_staff").insert(formattedStaff);
    }

    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  try {
    // Format the invoice for the API
    const apiInvoice = formatInvoiceForApi(invoice);
    delete apiInvoice.created_at; // Don't update the created_at timestamp

    // Update the invoice
    const { data, error } = await supabase
      .from("invoices")
      .update(apiInvoice)
      .eq("id", invoice.id)
      .select();

    if (error) {
      throw error;
    }

    // Delete existing invoice items and re-insert
    await supabase.from("invoice_items").delete().eq("invoice_id", invoice.id);

    // Insert the updated invoice items
    if (invoice.items && invoice.items.length > 0) {
      const formattedItems = invoice.items.map((item) => ({
        invoice_id: invoice.id,
        id: item.id || crypto.randomUUID(),
        name: item.name || null,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        hours: item.hours || false,
        category: item.category || null,
        sku: item.sku || null,
        total: item.total || item.quantity * item.price,
      }));

      await supabase.from("invoice_items").insert(formattedItems);
    }

    // Update assigned staff
    await supabase.from("invoice_staff").delete().eq("invoice_id", invoice.id);

    if (invoice.assignedStaff && invoice.assignedStaff.length > 0) {
      const formattedStaff = invoice.assignedStaff.map((staff) => ({
        invoice_id: invoice.id,
        staff_name: staff.name,
      }));

      await supabase.from("invoice_staff").insert(formattedStaff);
    }

    return invoice;
  } catch (error) {
    console.error(`Error updating invoice ${invoice.id}:`, error);
    throw error;
  }
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    // Delete invoice items first (foreign key constraint)
    await supabase.from("invoice_items").delete().eq("invoice_id", id);

    // Delete invoice staff (foreign key constraint)
    await supabase.from("invoice_staff").delete().eq("invoice_id", id);

    // Delete the invoice
    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    return false;
  }
};

export const getInvoiceTemplates = async (): Promise<InvoiceTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from("invoice_templates")
      .select("*");

    if (error) {
      throw error;
    }

    // Fetch template items for each template
    const templatesWithItems = await Promise.all(
      data.map(async (template) => {
        const { data: items, error: itemsError } = await supabase
          .from("invoice_template_items")
          .select("*")
          .eq("template_id", template.id);

        if (itemsError) {
          console.error("Error fetching template items:", itemsError);
          return { ...template, default_items: [] };
        }

        return { ...template, default_items: items || [] };
      })
    );

    return templatesWithItems;
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    return [];
  }
};

export const saveInvoiceTemplate = async (
  template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">
): Promise<InvoiceTemplate> => {
  try {
    // Insert the template
    const { data, error } = await supabase
      .from("invoice_templates")
      .insert([
        {
          name: template.name,
          description: template.description,
          default_tax_rate: template.default_tax_rate,
          default_notes: template.default_notes,
          default_due_date_days: template.default_due_date_days,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    const newTemplate = data[0];

    // Insert template items if available
    if (template.default_items && template.default_items.length > 0) {
      const formattedItems = template.default_items.map((item) => ({
        template_id: newTemplate.id,
        name: item.name || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        price: item.price || 0,
        hours: item.hours || false,
        category: item.category || null,
        sku: item.sku || null,
      }));

      await supabase.from("invoice_template_items").insert(formattedItems);
    }

    return {
      ...newTemplate,
      default_items: template.default_items || [],
      usage_count: 0,
    };
  } catch (error) {
    console.error("Error saving invoice template:", error);
    throw error;
  }
};

export const saveInvoice = async (invoiceData: Invoice) => {
  try {
    // Create normalized invoice object for database
    const invoiceForDb = {
      id: invoiceData.id,
      number: invoiceData.number,
      customer: invoiceData.customer,
      customer_id: invoiceData.customer_id,
      customer_email: invoiceData.customer_email,
      customer_address: invoiceData.customer_address,
      date: invoiceData.date,
      due_date: invoiceData.due_date,
      issue_date: invoiceData.issue_date || invoiceData.date || new Date().toISOString(), // Add required issue_date
      status: invoiceData.status,
      subtotal: invoiceData.subtotal,
      tax_rate: invoiceData.tax_rate,
      tax: invoiceData.tax,
      total: invoiceData.total,
      notes: invoiceData.notes,
      work_order_id: invoiceData.work_order_id,
      created_by: invoiceData.created_by,
      payment_method: invoiceData.payment_method
    };

    // Insert invoice to database
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert(invoiceForDb);

    if (invoiceError) {
      throw invoiceError;
    }

    // Save invoice items if they exist
    if (invoiceData.items && invoiceData.items.length > 0) {
      const itemsForDb = invoiceData.items.map(item => ({
        invoice_id: invoiceData.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        hours: item.hours || false,
        total: item.quantity * item.price,
      }));

      // First delete existing items
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceData.id);

      // Then insert new items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsForDb);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Save staff assignments if they exist
    if (invoiceData.assignedStaff && invoiceData.assignedStaff.length > 0) {
      const staffForDb = invoiceData.assignedStaff.map(staff => ({
        invoice_id: invoiceData.id,
        staff_name: staff.name,
      }));

      // First delete existing staff
      await supabase
        .from('invoice_staff')
        .delete()
        .eq('invoice_id', invoiceData.id);

      // Then insert new staff
      const { error: staffError } = await supabase
        .from('invoice_staff')
        .insert(staffForDb);

      if (staffError) {
        throw staffError;
      }
    }

    return invoiceData;
  } catch (error) {
    console.error("Error saving invoice:", error);
    throw error;
  }
};
