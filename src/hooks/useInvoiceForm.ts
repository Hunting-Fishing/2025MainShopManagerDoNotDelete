
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createInvoiceFromWorkOrder } from "@/utils/workOrderUtils";
import { Invoice, WorkOrder, InvoiceUpdater } from "@/types/invoice";
import { useInvoiceItems } from "@/hooks/invoice/useInvoiceItems";
import { useInvoiceStaff } from "@/hooks/invoice/useInvoiceStaff";
import { useInvoiceWorkOrder } from "@/hooks/invoice/useInvoiceWorkOrder";
import { 
  createDefaultInvoice, 
  calculateSubtotal, 
  calculateTax, 
  calculateTotal 
} from "@/utils/invoiceUtils";

export function useInvoiceForm(initialWorkOrderId?: string) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);

  // Create default invoice
  const defaultInvoice = createDefaultInvoice(initialWorkOrderId);
  
  // Form state
  const [invoice, setInvoice] = useState<Invoice>(defaultInvoice);
  
  // Use specialized hooks
  const { 
    items, 
    setItems,
    handleAddInventoryItem, 
    handleRemoveItem,
    handleUpdateItemQuantity,
    handleUpdateItemDescription,
    handleUpdateItemPrice,
    handleAddLaborItem 
  } = useInvoiceItems(invoice.items);
  
  const { 
    assignedStaff, 
    setAssignedStaff,
    handleAddStaffMember, 
    handleRemoveStaffMember 
  } = useInvoiceStaff(invoice.assignedStaff);

  // Sync items and staff with main invoice state
  const updateInvoice = (updater: InvoiceUpdater) => {
    const updatedInvoice = updater(invoice);
    setInvoice(updatedInvoice);
    
    // Update related states if those properties were updated
    if (updatedInvoice.items !== invoice.items) setItems(updatedInvoice.items);
    if (updatedInvoice.assignedStaff !== invoice.assignedStaff) setAssignedStaff(updatedInvoice.assignedStaff);
  };

  // Handle selecting a work order
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    const workOrderUpdates = useInvoiceWorkOrder().handleSelectWorkOrder(workOrder);
    
    updateInvoice((prev) => ({
      ...prev,
      workOrderId: workOrderUpdates.workOrderId,
      customer: workOrderUpdates.customer,
      description: workOrderUpdates.description,
      assignedStaff: workOrderUpdates.assignedStaff
    }));
    
    setShowWorkOrderDialog(false);
  };

  // Calculate totals
  const taxRate = 0.08; // 8% tax rate - this could be configurable
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, tax);

  // Handle saving invoice
  const handleSaveInvoice = async (status: string) => {
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
    invoice,
    subtotal,
    tax,
    taxRate,
    total,
    isSubmitting,
    showWorkOrderDialog,
    showInventoryDialog,
    showStaffDialog,
    setInvoice: updateInvoice,
    setShowWorkOrderDialog,
    setShowInventoryDialog,
    setShowStaffDialog,
    handleSelectWorkOrder,
    handleAddInventoryItem,
    handleAddStaffMember,
    handleRemoveStaffMember,
    handleRemoveItem,
    handleUpdateItemQuantity,
    handleUpdateItemDescription,
    handleUpdateItemPrice,
    handleAddLaborItem,
    handleSaveInvoice,
  };
}
