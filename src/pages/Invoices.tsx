
import { useInvoiceFilters } from "@/hooks/invoices/useInvoiceFilters";
import { InvoiceListHeader } from "@/components/invoices/InvoiceListHeader";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { invoices } from "@/data/invoiceData";
import { Invoice } from "@/types/invoice";
import { useState } from "react";

export default function Invoices() {
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
      />

      {/* Invoices table with export functionality */}
      <InvoiceList invoices={filteredInvoices} />
    </div>
  );
}
