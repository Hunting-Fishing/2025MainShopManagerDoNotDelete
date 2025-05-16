
import { useState, useEffect } from "react";
import { getInvoices } from "@/services/invoiceService";
import { Invoice } from "@/types/invoice";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await getInvoices();
        setInvoices(data);
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(err?.message || "Failed to load invoices"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return { invoices, isLoading, error };
}
