
import React, { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';
import { InvoiceListTable } from './InvoiceListTable';
import { InvoiceFilters } from './filters/InvoiceFilters';

interface InvoiceListProps {
  invoices: Invoice[];
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices }) => {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices);
  const [filters, setFilters] = useState({
    status: '',
    customer: '',
    dateRange: {
      from: null as Date | null,
      to: null as Date | null
    }
  });

  // Apply filters whenever filters or invoices change
  useEffect(() => {
    let result = [...invoices];
    
    // Filter by status
    if (filters.status) {
      result = result.filter(invoice => invoice.status === filters.status);
    }
    
    // Filter by customer name
    if (filters.customer) {
      result = result.filter(invoice => {
        // Handle customer as a string type
        const customerName = invoice.customer.toLowerCase();
        return customerName.includes(filters.customer.toLowerCase());
      });
    }
    
    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.date || '');
        
        if (filters.dateRange.from && filters.dateRange.to) {
          return invoiceDate >= filters.dateRange.from && invoiceDate <= filters.dateRange.to;
        }
        
        if (filters.dateRange.from) {
          return invoiceDate >= filters.dateRange.from;
        }
        
        if (filters.dateRange.to) {
          return invoiceDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }
    
    setFilteredInvoices(result);
  }, [filters, invoices]);

  const resetFilters = () => {
    setFilters({
      status: '',
      customer: '',
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  return (
    <div className="space-y-6">
      <InvoiceFilters 
        filters={filters} 
        setFilters={setFilters} 
        resetFilters={resetFilters} 
      />
      <InvoiceListTable invoices={filteredInvoices} />
    </div>
  );
};
