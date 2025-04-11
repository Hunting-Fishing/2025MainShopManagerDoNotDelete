
import { Invoice, InvoiceItem } from "@/types/invoice";

/**
 * Calculate subtotal (sum of all items)
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + (item.total || 0), 0);
}

/**
 * Calculate tax based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

/**
 * Calculate total (subtotal + tax)
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

/**
 * Calculate subtotal, tax and total for an invoice
 */
export function calculateInvoiceTotals(invoice: Invoice) {
  const subtotal = calculateSubtotal(invoice.items || []);
  const tax = calculateTax(subtotal, invoice.tax || 0);
  const total = calculateTotal(subtotal, tax);
  
  return {
    subtotal,
    tax,
    total
  };
}

/**
 * Get display color based on invoice status
 */
export function getInvoiceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'text-slate-500 bg-slate-100';
    case 'pending':
      return 'text-amber-500 bg-amber-50';
    case 'paid':
      return 'text-emerald-500 bg-emerald-50';
    case 'overdue':
      return 'text-red-500 bg-red-50';
    case 'cancelled':
      return 'text-gray-500 bg-gray-100';
    default:
      return 'text-slate-500 bg-slate-100';
  }
}

/**
 * Create a default invoice object
 */
export function createDefaultInvoice(): Invoice {
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30); // Default due date is 30 days from now
  
  return {
    id: '',
    customer: '',
    customer_id: '',
    customer_email: '',
    customer_address: '',
    date: today.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    description: '',
    items: [],
    tax: 0.0,
    subtotal: 0,
    total: 0,
    paymentMethod: 'Credit Card'
  };
}
