
import React from "react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { useInvoices } from "@/hooks/useInvoices";

export default function Invoices() {
  const { invoices, isLoading, error } = useInvoices();

  return (
    <div className="container mx-auto px-4 py-8">
      <InvoiceList invoices={invoices} isLoading={isLoading} error={error} />
    </div>
  );
}
