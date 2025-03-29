
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import { createInvoiceFromWorkOrder } from "@/utils/workOrderUtils";

export function useInvoiceSave() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!invoice.customer || !items.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedInvoice = {
        ...invoice,
        items,
        assignedStaff,
        status,
        subtotal,
        tax,
        total,
      };

      // If this invoice is created from a work order, use that function
      if (invoice.workOrderId) {
        await createInvoiceFromWorkOrder(invoice.workOrderId, updatedInvoice);
      } else {
        // In a real app, this would be an API call to create a new invoice
        console.log("Creating new invoice:", updatedInvoice);
      }
      
      // Show success message
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoice.id} has been created successfully.`,
      });
      
      // Navigate to invoices list
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSaveInvoice
  };
}
