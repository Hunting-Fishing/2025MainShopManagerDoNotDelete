
import { useState, useMemo } from "react";
import { Invoice } from "@/types/invoice";

export function useInvoiceFilters(invoices: Invoice[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [createdByFilter, setCreatedByFilter] = useState("all");

  // Get unique creators for filter
  const creators = useMemo(() => {
    return Array.from(new Set(invoices.map(invoice => invoice.createdBy))).sort();
  }, [invoices]);

  // Filter invoices based on search query and filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = 
        !searchQuery ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.workOrderId && invoice.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = 
        statusFilter.length === 0 || statusFilter.includes(invoice.status);
      
      const matchesCreator = 
        createdByFilter === "all" || invoice.createdBy === createdByFilter;
      
      return matchesSearch && matchesStatus && matchesCreator;
    });
  }, [invoices, searchQuery, statusFilter, createdByFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setCreatedByFilter("all");
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    createdByFilter,
    setCreatedByFilter,
    creators,
    filteredInvoices,
    resetFilters
  };
}
