
import { InvoiceItem } from "@/types/invoice";

/**
 * Calculate the subtotal of an invoice based on its items
 * @param items Array of invoice items
 * @returns Subtotal amount
 */
export const calculateSubtotal = (items: InvoiceItem[]): number => {
  if (!items || !items.length) return 0;
  
  return items.reduce((acc, item) => {
    const itemTotal = item.quantity * item.price;
    return acc + itemTotal;
  }, 0);
};

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param subtotal Subtotal amount
 * @param taxRate Tax rate as decimal (e.g., 0.07 for 7%)
 * @returns Tax amount
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * taxRate;
};

/**
 * Calculate the total amount of an invoice
 * @param subtotal Subtotal amount
 * @param tax Tax amount
 * @returns Total amount
 */
export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

/**
 * Format invoice number with proper padding
 * @param id Base ID for the invoice
 * @returns Formatted invoice number
 */
export const formatInvoiceNumber = (id: string): string => {
  if (!id) return '';
  
  // Extract just the numeric portion if it exists
  const numericPart = id.match(/\d+/);
  if (numericPart) {
    const number = parseInt(numericPart[0], 10);
    return `INV-${String(number).padStart(6, '0')}`;
  }
  
  // If no numeric part, use the whole ID
  return `INV-${id}`;
};

/**
 * Get appropriate color for invoice status
 * @param status Invoice status
 * @returns CSS color class for the status
 */
export const getInvoiceStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'text-slate-500 bg-slate-100';
    case 'pending':
      return 'text-amber-700 bg-amber-100';
    case 'paid':
      return 'text-green-700 bg-green-100';
    case 'overdue':
      return 'text-red-700 bg-red-100';
    case 'cancelled':
      return 'text-gray-700 bg-gray-100';
    default:
      return 'text-slate-500 bg-slate-100';
  }
};
