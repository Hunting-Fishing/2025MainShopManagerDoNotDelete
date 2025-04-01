
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import { createInvoiceFromWorkOrder } from "@/utils/workOrderUtils";
import { recordInvoiceActivity } from "@/utils/activityTracker";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { handleFormError, isNetworkError, handleNetworkError } from "@/utils/errorHandling";

// Mock current user - in a real app, this would come from auth context
const currentUser = { id: "user-123", name: "Admin User" };

export function useInvoiceSave() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveInvoice } = useInvoiceData();

  // Handle saving invoice
  const handleSaveInvoice = async (
    invoice: Invoice, 
    items: any[], 
    assignedStaff: string[], 
    subtotal: number, 
    tax: number, 
    total: number,
    status: string
  ) => {
    // Reset error state
    setError(null);
    
    // Basic validation
    if (!invoice.customer || !items.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      });
      setError("Please fill in all required fields and add at least one item.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for network connectivity
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        throw new Error("Network offline");
      }
      
      // Add activity tracking fields
      const updatedInvoice = {
        ...invoice,
        items,
        assignedStaff,
        status: status as "draft" | "pending" | "paid" | "overdue" | "cancelled",
        subtotal,
        tax,
        total,
        createdBy: invoice.createdBy || currentUser.name,
        lastUpdatedBy: currentUser.name,
        lastUpdatedAt: new Date().toISOString(),
      };

      // If this invoice is created from a work order, use that function
      if (invoice.workOrderId) {
        await createInvoiceFromWorkOrder(invoice.workOrderId, updatedInvoice);
        
        // Record the activity for connecting work order to invoice
        recordInvoiceActivity(
          "Created from work order " + invoice.workOrderId, 
          invoice.id, 
          currentUser.id, 
          currentUser.name
        );
      } else {
        // Use our new service to save the invoice with proper error handling
        await saveInvoice({ invoice: updatedInvoice, items });
        
        // Record the activity
        recordInvoiceActivity(
          "Created", 
          invoice.id, 
          currentUser.id, 
          currentUser.name
        );
      }
      
      // Show success message
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoice.id} has been created successfully.`,
        variant: "success",
      });
      
      // Navigate to invoices list
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      
      // Handle specific network errors
      if (isNetworkError(error)) {
        handleNetworkError();
        setError("Network connectivity issue. Please check your internet connection.");
      } else {
        // Handle other form errors
        const errorResult = handleFormError(error, "Invoice");
        setError(errorResult.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSaveInvoice,
    error
  };
}
