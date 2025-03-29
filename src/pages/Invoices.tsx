
import { useInvoiceFilters } from "@/hooks/invoices/useInvoiceFilters";
import { InvoiceListHeader } from "@/components/invoices/InvoiceListHeader";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice";

export default function Invoices() {
  const { invoices, isLoading } = useInvoiceData();
  
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    createdByFilter,
    setCreatedByFilter,
    creators,
    filteredInvoices,
    resetFilters
  } = useInvoiceFilters(invoices as Invoice[]);

  // When invoices data changes, reapply the filters
  useEffect(() => {
    // The useInvoiceFilters hook will automatically refilter when invoices change
  }, [invoices]);

  // Convert the status filter array to a string for the UI component
  const statusFilterString = statusFilter.length === 1 ? statusFilter[0] : "all";
  const handleStatusFilterChange = (status: string) => {
    if (status === "all") {
      setStatusFilter([]);
    } else {
      setStatusFilter([status]);
    }
  };

  return (
    <div className="space-y-6">
      <InvoiceListHeader />

      {/* Filters and search */}
      <InvoiceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilterString}
        setStatusFilter={handleStatusFilterChange}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        creators={creators}
        onResetFilters={resetFilters}
        isLoading={isLoading}
      />

      {/* Invoices table with export functionality */}
      <InvoiceList />
    </div>
  );
}
