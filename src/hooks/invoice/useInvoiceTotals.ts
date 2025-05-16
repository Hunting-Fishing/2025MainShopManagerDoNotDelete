
import { useMemo } from 'react';
import { InvoiceItem } from '@/types/invoice';

export const useInvoiceTotals = (items: InvoiceItem[] = []) => {
  const [subtotal, tax, taxRate, total] = useMemo(() => {
    // Calculate subtotal
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
    
    // Use a default tax rate or get from context/settings
    const calculatedTaxRate = 7.5; // Default 7.5%
    
    // Calculate tax
    const calculatedTax = (calculatedSubtotal * calculatedTaxRate) / 100;
    
    // Calculate total
    const calculatedTotal = calculatedSubtotal + calculatedTax;
    
    return [calculatedSubtotal, calculatedTax, calculatedTaxRate, calculatedTotal];
  }, [items]);

  return {
    subtotal,
    tax,
    taxRate,
    total
  };
};
