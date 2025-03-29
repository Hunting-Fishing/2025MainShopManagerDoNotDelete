
import { useState } from "react";
import { Invoice, InvoiceUpdater } from "@/types/invoice";
import { createDefaultInvoice } from "@/utils/invoiceUtils";
import { useInvoiceItems } from "@/hooks/invoice/useInvoiceItems";
import { useInvoiceStaff } from "@/hooks/invoice/useInvoiceStaff";

export function useInvoiceFormState(initialWorkOrderId?: string) {
  // Create default invoice
  const defaultInvoice = createDefaultInvoice(initialWorkOrderId);
  
  // Form state
  const [invoice, setInvoice] = useState<Invoice>(defaultInvoice);
  
  // Dialog states
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
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

  return {
    invoice,
    setInvoice: updateInvoice,
    items,
    assignedStaff,
    showWorkOrderDialog,
    setShowWorkOrderDialog,
    showInventoryDialog,
    setShowInventoryDialog,
    showStaffDialog,
    setShowStaffDialog,
    handleAddInventoryItem,
    handleRemoveItem,
    handleUpdateItemQuantity,
    handleUpdateItemDescription,
    handleUpdateItemPrice,
    handleAddLaborItem,
    handleAddStaffMember,
    handleRemoveStaffMember,
  };
}
