
import { useState } from "react";
import { Invoice } from "@/types/invoice";

interface InvoiceFilters {
  status: string;
  workOrderId: string;
  createdBy: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export const useInvoiceFilters = (invoices: Invoice[]) => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: "all",
    workOrderId: "",
    createdBy: "",
    dateRange: {},
  });

  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    if (filters.status !== "all" && invoice.status !== filters.status) {
      return false;
    }

    // Work order filter
    if (filters.workOrderId && invoice.work_order_id !== filters.workOrderId) {
      return false;
    }

    // Created by filter
    if (filters.createdBy && invoice.created_by !== filters.createdBy) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const invoiceDate = new Date(invoice.issue_date);

      if (filters.dateRange.from && invoiceDate < filters.dateRange.from) {
        return false;
      }

      if (filters.dateRange.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (invoiceDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  const updateFilter = <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      workOrderId: "",
      createdBy: "",
      dateRange: {},
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredInvoices,
  };
};
