
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Invoice } from "@/types/invoice";
import { toast } from "@/hooks/use-toast";

export function useInvoiceSave() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveInvoice = async (
    invoice: Invoice,
    status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Create a proper invoice object to save
      const invoiceToSave = {
        ...invoice,
        status,
        // Ensure dates are in the correct format
        issue_date: formatDate(invoice.issue_date),
        due_date: formatDate(invoice.due_date),
      };

      // In a real app, this would be an API call
      await mockSaveInvoice(invoiceToSave);

      toast({
        title: "Success",
        description: `Invoice ${status === "draft" ? "saved as draft" : "created"} successfully.`,
      });

      // Redirect to invoice list or view
      navigate("/invoices");
      return true;
    } catch (error) {
      console.error("Failed to save invoice:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setSaveError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to save invoice: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveInvoice, isSaving, saveError };
}

// Helper functions
function formatDate(date: string): string {
  // Ensure date is in YYYY-MM-DD format
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Mock API call
async function mockSaveInvoice(invoice: Invoice): Promise<Invoice> {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // Validate required fields
      if (!invoice.customer) {
        reject(new Error("Customer is required"));
        return;
      }
      
      // For demo, just return the invoice with an ID
      resolve({
        ...invoice,
        id: invoice.id || `INV-${Date.now().toString().slice(-6)}`,
      });
    }, 1000);
  });
}
