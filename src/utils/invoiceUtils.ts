
import { Invoice } from '@/types/invoice';

/**
 * Formats API response to match our Invoice type
 */
export const formatApiInvoice = (apiInvoice: any): Invoice => {
  return {
    id: apiInvoice.id || '',
    number: apiInvoice.number || apiInvoice.id || '',
    customer: apiInvoice.customer || '',
    customer_id: apiInvoice.customer_id,
    customer_address: apiInvoice.customer_address || '',
    customer_email: apiInvoice.customer_email || '',
    status: apiInvoice.status || 'draft',
    issue_date: apiInvoice.issue_date || apiInvoice.date || new Date().toISOString().split('T')[0],
    due_date: apiInvoice.due_date || '',
    date: apiInvoice.date || apiInvoice.issue_date || new Date().toISOString().split('T')[0],
    description: apiInvoice.description || '',
    payment_method: apiInvoice.payment_method || '',
    subtotal: Number(apiInvoice.subtotal) || 0,
    tax: Number(apiInvoice.tax) || 0,
    tax_rate: Number(apiInvoice.tax_rate) || 0,
    total: Number(apiInvoice.total) || 0,
    notes: apiInvoice.notes || '',
    work_order_id: apiInvoice.work_order_id || '',
    created_by: apiInvoice.created_by || '',
    created_at: apiInvoice.created_at || new Date().toISOString(),
    updated_at: apiInvoice.updated_at || new Date().toISOString(),
    assignedStaff: apiInvoice.assignedStaff || [],
    items: apiInvoice.items || []
  };
};

/**
 * Formats our Invoice object for API submission
 */
export const formatInvoiceForApi = (invoice: Invoice): any => {
  return {
    ...invoice,
    // Ensure numeric fields are properly formatted
    subtotal: Number(invoice.subtotal),
    tax: Number(invoice.tax),
    tax_rate: Number(invoice.tax_rate),
    total: Number(invoice.total)
  };
};
