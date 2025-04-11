
import { useState, useEffect } from 'react';
import { InvoiceItem } from '@/types/invoice';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/utils/invoiceUtils';

export function useInvoiceTotals(items: InvoiceItem[]) {
  const [taxRate, setTaxRate] = useState<number>(0.07); // Default 7% tax
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = calculateSubtotal(items);
    setSubtotal(newSubtotal);
    
    // Calculate tax
    const newTax = calculateTax(newSubtotal, taxRate);
    setTax(newTax);
    
    // Calculate total
    const newTotal = calculateTotal(newSubtotal, newTax);
    setTotal(newTotal);
  }, [items, taxRate]);

  return {
    taxRate,
    setTaxRate,
    subtotal,
    tax,
    total
  };
}
