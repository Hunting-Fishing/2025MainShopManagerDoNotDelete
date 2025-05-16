
import { Invoice, InvoiceFilters } from "@/types/invoice";

/**
 * Filter invoices based on applied filters
 * @param invoices Array of invoices
 * @param filters Filter criteria
 * @returns Filtered array of invoices
 */
export const filterInvoices = (invoices: Invoice[], filters: InvoiceFilters): Invoice[] => {
  return invoices.filter(invoice => {
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (Array.isArray(filters.status)) {
        if (!filters.status.includes(invoice.status)) {
          return false;
        }
      } else if (filters.status !== invoice.status) {
        return false;
      }
    }
    
    // Filter by customer name
    if (filters.customerName && invoice.customer) {
      if (!invoice.customer.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by customer ID
    if (filters.customer && invoice.customer_id) {
      if (invoice.customer_id !== filters.customer) {
        return false;
      }
    }
    
    // Filter by amount range
    const total = invoice.total || 0;
    if (filters.minAmount !== undefined && total < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== undefined && total > filters.maxAmount) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const invoiceDate = new Date(invoice.date);
      
      if (filters.dateRange.from && invoiceDate < filters.dateRange.from) {
        return false;
      }
      
      if (filters.dateRange.to) {
        const toDateEnd = new Date(filters.dateRange.to);
        toDateEnd.setHours(23, 59, 59, 999); // End of day
        if (invoiceDate > toDateEnd) {
          return false;
        }
      }
    }
    
    return true;
  });
};
