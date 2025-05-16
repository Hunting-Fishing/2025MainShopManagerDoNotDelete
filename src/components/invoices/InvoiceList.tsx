
import React, { useState } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceListTable } from "./InvoiceListTable";
import { InvoiceListExportMenu } from "./InvoiceListExportMenu";
import { Invoice, InvoiceFilters as InvoiceFiltersType } from "@/types/invoice";
import { filterInvoices } from "@/utils/invoiceFilters";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function InvoiceList({ invoices, isLoading = false }: InvoiceListProps) {
  const [filters, setFilters] = useState<InvoiceFiltersType>({
    status: [],
    customerName: "",
    dateRange: { from: null, to: null },
    minAmount: undefined,
    maxAmount: undefined
  });

  // Apply filters to invoices
  const filteredInvoices = filterInvoices(invoices, filters);

  // Handle filter changes
  const handleFilterChange = <K extends keyof InvoiceFiltersType>(
    field: K, 
    value: InvoiceFiltersType[K]
  ) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      status: [],
      customerName: "",
      dateRange: { from: null, to: null },
      minAmount: undefined,
      maxAmount: undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading invoices..."
                : `${filteredInvoices.length} total invoices`}
            </CardDescription>
          </div>
          {/* Pass invoices prop to InvoiceListExportMenu */}
          {filteredInvoices.length > 0 && (
            <InvoiceListExportMenu invoices={filteredInvoices} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <div className="border-b">
          <InvoiceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            setFilters={setFilters}
            resetFilters={handleResetFilters}
          />
        </div>
        {/* Pass necessary props to InvoiceListTable */}
        <InvoiceListTable 
          invoices={filteredInvoices} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
}
