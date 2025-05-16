
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InvoiceListHeader } from "./InvoiceListHeader";
import { InvoiceListTable } from "./InvoiceListTable";
import { InvoiceFiltersDropdown } from "./InvoiceFiltersDropdown";
import { Invoice } from "@/types/invoice";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading?: boolean;
  error?: Error | null;
}

export function InvoiceList({ invoices, isLoading, error }: InvoiceListProps) {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices);
  
  // Apply filters function
  const applyFilters = (filters: any) => {
    let result = [...invoices];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(invoice => invoice.status === filters.status);
    }
    
    // Filter by date range
    if (filters.dateRange && filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      result = result.filter(invoice => new Date(invoice.date || invoice.issue_date) >= fromDate);
    }
    
    if (filters.dateRange && filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      result = result.filter(invoice => new Date(invoice.date || invoice.issue_date) <= toDate);
    }
    
    // Filter by creator if applicable
    if (filters.created_by) {
      result = result.filter(invoice => invoice.created_by?.toLowerCase().includes(filters.created_by.toLowerCase()));
    }
    
    // Filter by search term (customer name, invoice number)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(invoice => 
        invoice.id.toLowerCase().includes(term) || 
        invoice.customer.toLowerCase().includes(term) ||
        (invoice.created_by || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredInvoices(result);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={() => {}} />;
  }

  if (!invoices || invoices.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <InvoiceListHeader />
          <InvoiceFiltersDropdown 
            onApplyFilters={applyFilters} 
          />
        </div>
        
        <InvoiceListTable invoices={filteredInvoices} />
      </div>
    </Card>
  );
}
