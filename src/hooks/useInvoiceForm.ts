
import { useInvoiceFormState } from "@/hooks/invoice/useInvoiceFormState";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";
import { useInvoiceSave } from "@/hooks/invoice/useInvoiceSave";
import { useInvoiceTotals } from "@/hooks/invoice/useInvoiceTotals";
import { useInvoiceWorkOrder } from "@/hooks/invoice/useInvoiceWorkOrder";

export function useInvoiceForm(initialWorkOrderId?: string) {
  // Use form state hook
  const {
    invoice,
    setInvoice,
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
  } = useInvoiceFormState(initialWorkOrderId);

  // Use invoice templates hook
  const { 
    templates,
    handleApplyTemplate, 
    handleSaveTemplate 
  } = useInvoiceTemplates(setInvoice);

  // Use invoice totals hook
  const { 
    taxRate, 
    subtotal, 
    tax, 
    total 
  } = useInvoiceTotals(items);

  // Use invoice save hook
  const { 
    isSubmitting, 
    handleSaveInvoice 
  } = useInvoiceSave();

  // Handle work order selection
  const { handleSelectWorkOrder } = useInvoiceWorkOrder();

  // Wrap the save invoice function to include all required data
  const saveInvoice = (status: string) => {
    handleSaveInvoice(
      invoice,
      items,
      assignedStaff,
      subtotal,
      tax,
      total,
      status
    );
  };

  // Handle selecting a work order (adapt to work with our form)
  const selectWorkOrder = (workOrder: any) => {
    if (!workOrder) return;
    
    const workOrderUpdates = handleSelectWorkOrder(workOrder);
    
    setInvoice((prev) => ({
      ...prev,
      workOrderId: workOrderUpdates.workOrderId,
      customer: workOrderUpdates.customer,
      description: workOrderUpdates.description,
      assignedStaff: workOrderUpdates.assignedStaff
    }));
    
    setShowWorkOrderDialog(false);
  };

  return {
    // Form state
    invoice,
    subtotal,
    tax,
    taxRate,
    total,
    isSubmitting,
    
    // Dialog states
    showWorkOrderDialog,
    showInventoryDialog,
    showStaffDialog,
    
    // Templates
    templates,
    
    // Setters
    setInvoice,
    setShowWorkOrderDialog,
    setShowInventoryDialog,
    setShowStaffDialog,
    
    // Event handlers
    handleSelectWorkOrder: selectWorkOrder,
    handleAddInventoryItem,
    handleAddStaffMember,
    handleRemoveStaffMember,
    handleRemoveItem,
    handleUpdateItemQuantity,
    handleUpdateItemDescription,
    handleUpdateItemPrice,
    handleAddLaborItem,
    handleSaveInvoice: saveInvoice,
    handleApplyTemplate,
    handleSaveTemplate,
  };
}
