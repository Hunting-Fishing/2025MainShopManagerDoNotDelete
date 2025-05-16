
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

// Create a placeholder implementation for useInvoiceFormState if needed
const useInvoiceFormStatePlaceholder = (props?: UseInvoiceFormStateProps) => {
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    customer: "",
    customer_address: "",
    customer_email: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    items: [],
    created_by: "",
    created_at: new Date().toISOString()
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
  const handleAddInventoryItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };
  
  const handleUpdateItemDescription = (id: string, description: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, description } : item));
  };
  
  const handleUpdateItemPrice = (id: string, price: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, price } : item));
  };
  
  const handleAddLaborItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
  };
  
  const handleAddStaffMember = (member: StaffMember) => {
    setAssignedStaff(prev => [...prev, member]);
  };
  
  const handleRemoveStaffMember = (id: string) => {
    setAssignedStaff(prev => prev.filter(member => member.id !== id));
  };
  
  return {
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
  };
};

export function useInvoiceForm(initialWorkOrderId?: string) {
  // Use actual form state hook if it's properly implemented, otherwise use placeholder
  const useFormStateHook = useInvoiceFormState || useInvoiceFormStatePlaceholder;
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
  } = useFormStateHook(props);

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
    // Pass the staff members directly, not as strings
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
      return {
        ...prev,
        workOrderId: workOrderUpdates.workOrderId,
        customer: workOrderUpdates.customer,
        description: workOrderUpdates.description,
        assignedStaff: Array.isArray(workOrderUpdates.assignedStaff) 
          ? workOrderUpdates.assignedStaff.map((staff: any) => {
              if (typeof staff === 'string') {
                return { id: crypto.randomUUID(), name: staff, role: '' };
              }
              return staff as StaffMember;
            })
          : prev.assignedStaff
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
