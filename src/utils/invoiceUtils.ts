
import { Invoice, InvoiceItem } from "@/types/invoice";

/**
 * Calculate the subtotal of invoice items
 */
export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0);
    return total + itemTotal;
  }, 0);
};

/**
 * Calculate tax amount based on subtotal and tax rate
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

/**
 * Calculate total amount (subtotal + tax)
 */
export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

/**
 * Get color for invoice status
 */
export const getInvoiceStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    overdue: "bg-red-100 text-red-800 border border-red-300",
    draft: "bg-slate-100 text-slate-800 border border-slate-300",
    cancelled: "bg-gray-100 text-gray-800 border border-gray-300"
  };
  
  return statusColors[status] || statusColors.pending;
};

/**
 * Format the invoice number with a prefix
 */
export const formatInvoiceNumber = (invoiceId: string): string => {
  if (!invoiceId) return '';
  
  // Check if the invoice ID already has the INV- prefix
  if (invoiceId.startsWith('INV-')) {
    return invoiceId;
  }
  
  // Extract any numerical portion to work with
  const matches = invoiceId.match(/(\d+)/);
  if (matches && matches[1]) {
    const numericPart = matches[1].padStart(5, '0');
    return `INV-${numericPart}`;
  }
  
  // If no numeric portion, just add the prefix
  return `INV-${invoiceId}`;
};
