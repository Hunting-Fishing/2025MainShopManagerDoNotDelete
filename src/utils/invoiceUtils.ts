
import { Invoice, InvoiceItem } from "@/types/invoice";
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculates the subtotal for an invoice based on item prices and quantities
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculates tax for an invoice based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

/**
 * Calculates total for an invoice including tax
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

/**
 * Creates a default invoice object with empty/default values
 */
export function createDefaultInvoice(workOrderId?: string): Invoice {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days by default
  
  return {
    id: uuidv4(),
    customer: '',
    customerEmail: '',
    customerAddress: '',
    date: today,
    dueDate: dueDate.toISOString().split('T')[0],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    items: [],
    notes: '',
    description: '',
    paymentMethod: '',
    workOrderId: workOrderId || '',
    assignedStaff: [],
    createdBy: '',
  };
}

/**
 * Formats invoice data from API response to match our Invoice type
 */
export function formatApiInvoice(apiInvoice: any): Invoice {
  return {
    id: apiInvoice.id,
    customer: apiInvoice.customer,
    customerEmail: apiInvoice.customer_email,
    customerAddress: apiInvoice.customer_address,
    date: apiInvoice.date,
    dueDate: apiInvoice.due_date,
    subtotal: Number(apiInvoice.subtotal) || 0,
    tax: Number(apiInvoice.tax) || 0,
    total: Number(apiInvoice.total) || 0,
    status: apiInvoice.status as Invoice['status'],
    items: apiInvoice.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.total),
      hours: item.hours || false
    })) || [],
    notes: apiInvoice.notes || '',
    description: apiInvoice.description || '',
    paymentMethod: apiInvoice.payment_method || '',
    workOrderId: apiInvoice.work_order_id || '',
    assignedStaff: apiInvoice.invoice_staff?.map((staff: any) => ({
      id: staff.id || '',
      name: staff.staff_name || '',
    })) || [],
    createdBy: apiInvoice.created_by || '',
  };
}

/**
 * Gets the appropriate color class for an invoice status
 */
export function getInvoiceStatusColor(status: string): string {
  const statusColors = {
    draft: 'bg-slate-200 text-slate-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-800'
  };
  
  return statusColors[status as keyof typeof statusColors] || statusColors.draft;
}
