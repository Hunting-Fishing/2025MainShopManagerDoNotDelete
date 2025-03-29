
import { Invoice, InvoiceItem } from "@/types/invoice";
import { calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoiceUtils";

export function useInvoiceTotals(items: InvoiceItem[]) {
  // Default tax rate - this could be configurable
  const taxRate = 0.08; // 8% tax rate
  
  // Calculate totals
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, tax);

  return {
    taxRate,
    subtotal,
    tax,
    total
  };
}
