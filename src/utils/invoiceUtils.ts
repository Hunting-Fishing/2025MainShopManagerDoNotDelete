
import { Invoice } from "@/types/invoice";

/**
 * Calculate subtotal, tax and total for an invoice
 */
export function calculateInvoiceTotals(invoice: Invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const tax = subtotal * (invoice.tax || 0);
  const total = subtotal + tax;
  
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
