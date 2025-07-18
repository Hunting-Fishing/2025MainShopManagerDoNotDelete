
import { useMemo } from 'react';
import { InvoiceItem } from '@/types/invoice';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { Customer } from '@/types/customer';
import { calculateTax } from '@/utils/taxCalculations';

interface UseInvoiceTotalsProps {
  items?: InvoiceItem[];
  customer?: Customer | null;
}

// Overloaded function signatures for backward compatibility
export function useInvoiceTotals(items: InvoiceItem[]): any;
export function useInvoiceTotals(props: UseInvoiceTotalsProps): any;
export function useInvoiceTotals(itemsOrProps: InvoiceItem[] | UseInvoiceTotalsProps) {
  // Determine if called with old signature (array) or new signature (object)
  const isOldSignature = Array.isArray(itemsOrProps);
  const items = isOldSignature ? itemsOrProps : itemsOrProps.items || [];
  const customer = isOldSignature ? null : itemsOrProps.customer;
  const { taxSettings, loading: taxSettingsLoading } = useTaxSettings();

  const calculations = useMemo(() => {
    // Calculate subtotal from invoice items
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    if (!taxSettings || taxSettingsLoading) {
      return {
        subtotal: calculatedSubtotal,
        tax: 0,
        taxRate: 0,
        total: calculatedSubtotal,
        isLoading: true,
        laborTax: 0,
        partsTax: 0,
        totalTax: 0,
        taxBreakdown: {
          laborTaxRate: 0,
          partsTaxRate: 0,
          taxDescription: 'Loading...'
        }
      };
    }

    // For invoice items, we assume they are mixed labor/parts
    // In a real implementation, you'd want to categorize invoice items
    const laborAmount = calculatedSubtotal * 0.6; // Assume 60% labor
    const partsAmount = calculatedSubtotal * 0.4; // Assume 40% parts

    // Determine if customer is tax exempt
    const isCustomerTaxExempt = customer?.labor_tax_exempt || customer?.parts_tax_exempt || false;
    const customerTaxExemptionId = customer?.tax_exempt_certificate_number;

    // Calculate taxes using the tax calculation utility
    const taxCalculation = calculateTax({
      laborAmount,
      partsAmount,
      taxSettings,
      isCustomerTaxExempt,
      customerTaxExemptionId
    });

    // Legacy compatibility
    const averageTaxRate = calculatedSubtotal > 0 
      ? (taxCalculation.totalTax / calculatedSubtotal) * 100 
      : 0;

    return {
      subtotal: calculatedSubtotal,
      tax: taxCalculation.totalTax,
      taxRate: averageTaxRate,
      total: taxCalculation.grandTotal,
      isLoading: false,
      laborTax: taxCalculation.laborTax,
      partsTax: taxCalculation.partsTax,
      totalTax: taxCalculation.totalTax,
      taxBreakdown: taxCalculation.taxBreakdown,
      isCustomerTaxExempt,
      customerTaxExemptionId
    };
  }, [items, customer, taxSettings, taxSettingsLoading]);

  return calculations;
};
