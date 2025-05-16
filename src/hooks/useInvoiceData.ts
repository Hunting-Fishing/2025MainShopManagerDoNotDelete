
import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice";

export const useInvoiceData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would call an API endpoint
        // For now, simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInvoices: Invoice[] = [
          {
            id: "inv-001",
            number: "INV-001",
            status: "pending",
            issue_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            customer: {
              id: "cust-001",
              name: "John Doe",
              email: "john@example.com",
              address: "123 Main St, Anytown, USA"
            },
            subtotal: 650,
            tax: 52,
            tax_rate: 8,
            total: 702,
            notes: "Thanks for your business!",
            created_by: "staff-001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            work_order_id: "wo-001",
            assigned_staff: []
          },
          {
            id: "inv-002",
            number: "INV-002",
            status: "paid",
            issue_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            customer: {
              id: "cust-002",
              name: "Jane Smith",
              email: "jane@example.com",
              address: "456 Oak Ave, Other City, USA"
            },
            subtotal: 850,
            tax: 68,
            tax_rate: 8,
            total: 918,
            notes: "Payment received. Thank you!",
            created_by: "staff-002",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            work_order_id: "wo-002",
            assigned_staff: []
          }
        ];
        
        setInvoices(mockInvoices);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const createInvoice = async (invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) => {
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newInvoice: Invoice = {
        id: `inv-${Math.floor(Math.random() * 10000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...invoice
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create invoice');
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === id 
            ? { ...invoice, ...updates, updated_at: new Date().toISOString() } 
            : invoice
        )
      );
      
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update invoice');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete invoice');
    }
  };

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice
  };
};
