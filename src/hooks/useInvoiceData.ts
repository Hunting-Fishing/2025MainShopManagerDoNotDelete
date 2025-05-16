
import { useState, useEffect } from "react";
import { getInvoiceById } from "@/services/invoiceService";
import { Invoice } from "@/types/invoice";

export const useInvoiceData = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInvoiceData = async (id: string): Promise<Invoice | null> => {
    try {
      const invoice = await getInvoiceById(id);
      if (!invoice) return null;
      
      // Fix customer type mismatch
      return {
        ...invoice,
        // Ensure that customer is handled as a string as required by the Invoice type
        customer: typeof invoice.customer === 'object' ? 
          (invoice.customer && 'name' in invoice.customer ? invoice.customer.name : String(invoice.customer)) : 
          (invoice.customer || ''),
        // Add any other necessary conversions
      };
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return null;
    }
  };

  const loadInvoice = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const invoiceData = await getInvoiceData(id);
      if (invoiceData) {
        setInvoice(invoiceData);
      } else {
        setError("Invoice not found");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  return {
    invoice,
    loading,
    error,
    loadInvoice,
    setInvoice,
  };
};
