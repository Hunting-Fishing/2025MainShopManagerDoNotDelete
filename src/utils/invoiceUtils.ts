
import { InvoiceItem } from "@/types/invoice";

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => total + (item.total || 0), 0);
};

export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

/**
 * Returns the appropriate CSS class for invoice status badges
 */
export const getInvoiceStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'draft':
      return 'bg-slate-100 text-slate-800 border border-slate-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-300';
  }
};
