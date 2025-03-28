
import { useInvoiceFilters } from "@/hooks/invoices/useInvoiceFilters";
import { InvoiceListHeader } from "@/components/invoices/InvoiceListHeader";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { invoices } from "@/data/invoiceData";

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
  } = useInvoiceFilters(invoices);

  return (
    <div className="space-y-6">
      <InvoiceListHeader />

      {/* Filters and search */}
      <InvoiceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        creators={creators}
        onResetFilters={resetFilters}
      />

      {/* Invoices table */}
      <InvoiceList invoices={filteredInvoices} />
    </div>
  );
}
