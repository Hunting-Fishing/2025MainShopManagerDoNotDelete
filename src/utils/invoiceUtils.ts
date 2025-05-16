
import { Invoice } from '@/types/invoice';

/**
 * Get the color for a specific invoice status
 */
export function getInvoiceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'pending':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'cancelled':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Format a raw API invoice object to match our Invoice type
 */
export function formatApiInvoice(apiInvoice: any): Invoice {
  return {
    id: apiInvoice.id,
    customer: apiInvoice.customer || '',
    customer_id: apiInvoice.customer_id,
    customer_address: apiInvoice.customer_address,
    customer_email: apiInvoice.customer_email,
    description: apiInvoice.description,
    notes: apiInvoice.notes,
    date: apiInvoice.date,
    due_date: apiInvoice.due_date,
    status: apiInvoice.status || 'draft',
    subtotal: apiInvoice.subtotal ? Number(apiInvoice.subtotal) : 0,
    tax: apiInvoice.tax ? Number(apiInvoice.tax) : 0,
    total: apiInvoice.total ? Number(apiInvoice.total) : 0,
    work_order_id: apiInvoice.work_order_id,
    payment_method: apiInvoice.payment_method,
    created_by: apiInvoice.created_by,
    created_at: apiInvoice.created_at,
    items: apiInvoice.items || [],
    assignedStaff: apiInvoice.assigned_staff || [],
    last_updated_by: apiInvoice.last_updated_by,
    last_updated_at: apiInvoice.last_updated_at,
    relatedWorkOrder: apiInvoice.related_work_order
  };
}

/**
 * Convert UI Invoice properties from camelCase to snake_case for API
 */
export function formatInvoiceForApi(invoice: Invoice): any {
  return {
    id: invoice.id,
    customer: invoice.customer,
    customer_id: invoice.customer_id,
    customer_address: invoice.customer_address,
    customer_email: invoice.customer_email,
    description: invoice.description,
    notes: invoice.notes,
    date: invoice.date,
    due_date: invoice.due_date,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    work_order_id: invoice.work_order_id,
    payment_method: invoice.payment_method,
    created_by: invoice.created_by,
    created_at: invoice.created_at,
    items: invoice.items,
    assigned_staff: invoice.assignedStaff,
    last_updated_by: invoice.last_updated_by,
    last_updated_at: invoice.last_updated_at,
    related_work_order: invoice.relatedWorkOrder
  };
}

/**
 * Calculate totals for an invoice
 */
export function calculateInvoiceTotals(invoice: Invoice, taxRate: number = 0.08) {
  if (!invoice.items || invoice.items.length === 0) {
    return {
      subtotal: 0,
      tax: 0,
      total: 0
    };
  }

  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total
  };
}
