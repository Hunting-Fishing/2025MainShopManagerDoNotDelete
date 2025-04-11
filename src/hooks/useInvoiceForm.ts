
import { useInvoiceFormState } from "@/hooks/invoice/useInvoiceFormState";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";
import { useInvoiceSave } from "@/hooks/invoice/useInvoiceSave";
import { useInvoiceTotals } from "@/hooks/invoice/useInvoiceTotals";
import { useInvoiceWorkOrder } from "@/hooks/invoice/useInvoiceWorkOrder";
import { StaffMember, Invoice, InvoiceTemplate } from "@/types/invoice";

export interface UseInvoiceFormStateProps {
  initialWorkOrderId?: string;
}

export function useInvoiceForm(initialWorkOrderId?: string) {
  // Use form state hook with correct typing
  const props: UseInvoiceFormStateProps = initialWorkOrderId ? { initialWorkOrderId } : {};
  
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
  } = useInvoiceFormState(props);

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
  const saveInvoice = (status: "draft" | "pending" | "paid" | "overdue" | "cancelled") => {
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
    
    setInvoice((prev: Invoice) => {
      // Convert string staff entries to StaffMember objects if needed
      const updatedAssignedStaff: StaffMember[] = Array.isArray(workOrderUpdates.assignedStaff) 
        ? workOrderUpdates.assignedStaff.map((staff: any) => {
            if (typeof staff === 'string') {
              return { id: crypto.randomUUID(), name: staff, role: '' };
            }
            return staff as StaffMember;
          })
        : prev.assignedStaff;
      
      return {
        ...prev,
        workOrderId: workOrderUpdates.workOrderId,
        customer: workOrderUpdates.customer,
        description: workOrderUpdates.description,
        assignedStaff: updatedAssignedStaff
      };
    });
    
    setShowWorkOrderDialog(false);
  };

  // Adapt template save function to handle parameter type
  const wrappedHandleSaveTemplate = (templateData: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => {
    handleSaveTemplate(templateData);
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
    handleSaveTemplate: wrappedHandleSaveTemplate,
  };
}
