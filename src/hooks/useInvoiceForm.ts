
import { useInvoiceFormState } from "@/hooks/invoice/useInvoiceFormState";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";
import { useInvoiceSave } from "@/hooks/invoice/useInvoiceSave";
import { useInvoiceTotals } from "@/hooks/invoice/useInvoiceTotals";
import { useInvoiceWorkOrder } from "@/hooks/invoice/useInvoiceWorkOrder";
import { StaffMember, Invoice, InvoiceTemplate, InvoiceItem } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { useState } from "react";
import { createEmptyInvoice } from "@/data/invoiceCreateData";

export interface UseInvoiceFormStateProps {
  initialWorkOrderId?: string;
}

// Create a complete placeholder implementation for useInvoiceFormState
const useInvoiceFormStatePlaceholder = (props?: UseInvoiceFormStateProps) => {
  const [invoice, setInvoice] = useState<Invoice>(createEmptyInvoice());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
  const handleAddInventoryItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), item]
    }));
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id)
    }));
  };
  
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, quantity };
        // Update total based on quantity
        updatedItem.total = updatedItem.price * quantity;
        return updatedItem;
      }
      return item;
    }));
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, quantity };
          // Update total based on quantity
          updatedItem.total = updatedItem.price * quantity;
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  const handleUpdateItemDescription = (id: string, description: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, description } : item));
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: (prev.items || []).map(item => item.id === id ? { ...item, description } : item)
    }));
  };
  
  const handleUpdateItemPrice = (id: string, price: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, price };
        // Update total based on price
        updatedItem.total = updatedItem.quantity * price;
        return updatedItem;
      }
      return item;
    }));
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, price };
          // Update total based on price
          updatedItem.total = updatedItem.quantity * price;
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  const handleAddLaborItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
    
    // Update invoice items
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), item]
    }));
  };
  
  const handleAddStaffMember = (member: StaffMember) => {
    setAssignedStaff(prev => [...prev, member]);
    
    // Update invoice assignedStaff
    setInvoice(prev => ({
      ...prev,
      assignedStaff: [...(prev.assignedStaff || []), member]
    }));
  };
  
  const handleRemoveStaffMember = (id: string) => {
    setAssignedStaff(prev => prev.filter(member => member.id !== id));
    
    // Update invoice assignedStaff
    setInvoice(prev => ({
      ...prev,
      assignedStaff: (prev.assignedStaff || []).filter(member => member.id !== id)
    }));
  };
  
  // Function to update a specific field in the invoice
  const updateInvoice = (field: keyof Invoice, value: any) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return {
    invoice,
    setInvoice,
    updateInvoice,
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
  
  const formState = useFormStateHook(props);
  
  // Destructure for convenience and type safety - ensure all required properties exist
  const {
    invoice,
    setInvoice,
    updateInvoice,
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
  } = formState;

  // Use invoice templates hook
  const { 
    templates,
    handleApplyTemplate, 
    handleSaveTemplate 
  } = useInvoiceTemplates(updateInvoice);

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
