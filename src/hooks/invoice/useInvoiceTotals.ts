
import { useMemo } from "react";
import { Invoice } from "@/types/invoice";
import { calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoiceUtils";

export function useInvoiceTotals(invoice: Invoice, taxRate: number = 0) {
  // Calculate invoice totals
  const subtotal = useMemo(() => calculateSubtotal(invoice.items), [invoice.items]);
  
  const tax = useMemo(() => calculateTax(subtotal, taxRate), [subtotal, taxRate]);
  
  const total = useMemo(() => calculateTotal(subtotal, tax), [subtotal, tax]);

  return {
    subtotal,
    tax,
    total
  };
}
