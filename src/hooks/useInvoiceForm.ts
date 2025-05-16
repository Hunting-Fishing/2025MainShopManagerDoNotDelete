
import { useInvoiceFormState } from "@/hooks/invoice/useInvoiceFormState";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";
import { useInvoiceSave } from "@/hooks/invoice/useInvoiceSave";
import { useInvoiceTotals } from "@/hooks/invoice/useInvoiceTotals";
import { useInvoiceWorkOrder } from "@/hooks/invoice/useInvoiceWorkOrder";
import { StaffMember, Invoice, InvoiceTemplate, InvoiceItem } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { useState } from "react";

export interface UseInvoiceFormStateProps {
  initialWorkOrderId?: string;
}

export function useInvoiceForm(initialWorkOrderId?: string) {
  // Create local state for items and assignedStaff if not provided by useInvoiceFormState
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
  // Use form state hook with correct typing
  const props: UseInvoiceFormStateProps = initialWorkOrderId ? { initialWorkOrderId } : {};
  
  const {
    invoice,
    setInvoice,
  } = useInvoiceFormState(props);

  // Add handlers for item management
  const handleAddInventoryItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const handleUpdateItemDescription = (id: string, description: string) => {
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, description } : item)
    );
  };

  const handleUpdateItemPrice = (id: string, price: number) => {
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, price } : item)
    );
  };

  const handleAddLaborItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: "Labor",
      quantity: 1,
      price: 0,
      type: "labor"
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddStaffMember = (staff: StaffMember) => {
    setAssignedStaff(prev => [...prev, staff]);
  };

  const handleRemoveStaffMember = (staffId: string) => {
    setAssignedStaff(prev => prev.filter(s => s.id !== staffId));
  };

  // Use invoice templates hook
  const { 
    templates,
    applyTemplate,
    saveTemplate
  } = useInvoiceTemplates();

  // Create wrapper functions for the template operations
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    const updatedInvoice = applyTemplate(template, invoice);
    setInvoice(updatedInvoice);
  };
  
  const handleSaveTemplate = (templateData: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => {
    return saveTemplate(templateData);
  };

  // Use invoice totals hook
  const totalsResult = useInvoiceTotals(items);
  const { subtotal, tax, total } = totalsResult;
  const taxRate = totalsResult.taxRate || 0;
  
  const onTaxRateChange = (newRate: number) => {
    // This would typically update taxRate in state
    console.log("Tax rate changed to:", newRate);
  };

  // Use invoice save hook
  const { 
    saveInvoice,
    isSaving: isSubmitting
  } = useInvoiceSave();

  // Wrap the save invoice function to include all required data
  const handleSaveInvoice = (status: "draft" | "pending" | "paid" | "overdue" | "cancelled") => {
    // Pass the staff members directly, not as strings
    saveInvoice(
      {
        ...invoice,
        items,
        assignedStaff
      },
      status
    );
  };

  // Handle selecting a work order
  const { handleSelectWorkOrder: selectWorkOrder } = useInvoiceWorkOrder();

  // Create a wrapper for selectWorkOrder
  const handleSelectWorkOrder = (workOrder: any) => {
    if (!workOrder) return;
    
    const workOrderUpdates = selectWorkOrder(workOrder);
    
    setInvoice((prev: Invoice) => {
      return {
        ...prev,
        work_order_id: workOrderUpdates.workOrderId,
        customer: workOrderUpdates.customer,
        description: workOrderUpdates.description,
      };
    });
    
    // Update assigned staff if provided
    if (Array.isArray(workOrderUpdates.assignedStaff)) {
      setAssignedStaff(
        workOrderUpdates.assignedStaff.map((staff: any) => {
          if (typeof staff === 'string') {
            return { id: crypto.randomUUID(), name: staff, role: '' };
          }
          return staff as StaffMember;
        })
      );
    }
    
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
    items,
    assignedStaff,
    
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
    handleApplyTemplate,
    handleSaveTemplate,
    onTaxRateChange,
  };
}
