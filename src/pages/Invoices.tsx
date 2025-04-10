
import { useInvoiceFilters } from "@/hooks/invoices/useInvoiceFilters";
import { InvoiceListHeader } from "@/components/invoices/InvoiceListHeader";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice";

export default function Invoices() {
  const { invoices, isLoading } = useInvoiceData();
  const [filters, setFilters] = useState({
    status: 'all',
    customer: '',
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });

  // Filtered invoices based on the current filters
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  
  // Reset filters function
  const resetFilters = () => {
    setFilters({
      status: 'all',
      customer: '',
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  // Filter invoices when data or filters change
  useEffect(() => {
    if (!invoices) {
      setFilteredInvoices([]);
      return;
    }
    
    const filtered = invoices.filter(invoice => {
      // Filter by status
      if (filters.status !== 'all' && invoice.status !== filters.status) {
        return false;
      }
      
      // Filter by customer name
      if (filters.customer && !invoice.customer.toLowerCase().includes(filters.customer.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateRange.from || filters.dateRange.to) {
        const invoiceDate = new Date(invoice.date);
        
        if (filters.dateRange.from && invoiceDate < filters.dateRange.from) {
          return false;
        }
        
        if (filters.dateRange.to && invoiceDate > filters.dateRange.to) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredInvoices(filtered);
  }, [invoices, filters]);

  return (
    <div className="space-y-6">
      <InvoiceListHeader />

      {/* Filters using the correct props structure */}
      <InvoiceFilters
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      {/* Invoices list component */}
      <InvoiceList />
    </div>
  );
}
