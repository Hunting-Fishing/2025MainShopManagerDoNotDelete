
import { useState } from "react";
import { Invoice, InvoiceItem, StaffMember } from "@/types/invoice";
import { createDefaultInvoice } from "@/utils/invoiceUtils";

export function useInvoiceFormState(initialWorkOrderId?: string) {
  const [invoice, setInvoice] = useState<Invoice>(createDefaultInvoice());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  
  // Dialog control states
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);

  // Handler for adding inventory item
  const handleAddInventoryItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
  };

  // Handler for removing an item
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handler for updating item quantity
  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      total: quantity * updatedItems[index].price
    };
    setItems(updatedItems);
  };

  // Handler for updating item description
  const handleUpdateItemDescription = (index: number, description: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      description
    };
    setItems(updatedItems);
  };

  // Handler for updating item price
  const handleUpdateItemPrice = (index: number, price: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      price,
      total: updatedItems[index].quantity * price
    };
    setItems(updatedItems);
  };

  // Handler for adding labor item
  const handleAddLaborItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, { ...item, hours: true }]);
  };

  // Handler for adding staff member
  const handleAddStaffMember = (staff: StaffMember) => {
    if (!assignedStaff.some(s => s.id === staff.id)) {
      setAssignedStaff(prev => [...prev, staff]);
    }
  };

  // Handler for removing staff member
  const handleRemoveStaffMember = (id: string) => {
    setAssignedStaff(prev => prev.filter(s => s.id !== id));
  };

  return {
    invoice,
    setInvoice,
    items,
    setItems,
    assignedStaff,
    setAssignedStaff,
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
