
import { useState } from "react";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Invoice } from "@/types/invoice";

interface InvoiceListProps {
  limit?: number;
}

export function InvoiceList({ limit }: InvoiceListProps) {
  const { invoices, isLoading, error, fetchInvoices } = useInvoiceData();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    customer: "",
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  // Handle refetching manually
  const refetch = () => {
    fetchInvoices();
  };

  const handleFilter = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Apply filters
    let result = [...invoices];
    
    if (newFilters.status) {
      result = result.filter(invoice => invoice.status === newFilters.status);
    }
    
    if (newFilters.customer) {
      const search = newFilters.customer.toLowerCase();
      result = result.filter(invoice => 
        invoice.customer.toLowerCase().includes(search)
      );
    }
    
    if (newFilters.dateRange.from) {
      result = result.filter(invoice => 
        new Date(invoice.date) >= new Date(newFilters.dateRange.from!)
      );
    }
    
    if (newFilters.dateRange.to) {
      result = result.filter(invoice => 
        new Date(invoice.date) <= new Date(newFilters.dateRange.to!)
      );
    }
    
    setFilteredInvoices(result);
  };

  const displayInvoices = filters.status || filters.customer || 
    filters.dateRange.from || filters.dateRange.to ? 
    filteredInvoices : invoices;

  // Limit the number of invoices if specified
  const limitedInvoices = limit ? displayInvoices.slice(0, limit) : displayInvoices;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex justify-between items-center">
          <InvoiceFilters onFilterChange={handleFilter} />
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refetch}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      <InvoiceTable 
        invoices={limitedInvoices} 
        isLoading={isLoading} 
      />
      
      {limit && displayInvoices.length > limit && (
        <div className="flex justify-center mt-4">
          <Button variant="outline">View All Invoices</Button>
        </div>
      )}
    </div>
  );
}
