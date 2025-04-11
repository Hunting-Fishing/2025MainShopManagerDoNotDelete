import { useState } from "react";
import { Invoice, InvoiceItem, StaffMember, InventoryItem } from "@/types/invoice";
import { toast } from "@/hooks/use-toast";

export interface UseInvoiceFormStateProps {
  initialWorkOrderId?: string;
}

export function useInvoiceFormState({ initialWorkOrderId }: UseInvoiceFormStateProps = {}) {
  // Set up state for invoice form
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    workOrderId: initialWorkOrderId || undefined,
    customer: "",
    customerEmail: "",
    customerAddress: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "draft",
    items: [],
    assignedStaff: [], // Initialize as empty array of StaffMember
    createdBy: ""
  });

  // Set up state for UI controls
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState<boolean>(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState<boolean>(false);
  const [showStaffDialog, setShowStaffDialog] = useState<boolean>(false);

  // Item management handlers
  const handleAddInventoryItem = (item: InventoryItem) => {
    // Create a new InvoiceItem from the InventoryItem
    const invoiceItem: InvoiceItem = {
      id: item.id,
      name: item.name,
      description: item.description || "",
      quantity: 1,
      price: item.price,
      total: item.price
    };
    
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        invoiceItem
      ]
    }));
    
    setShowInventoryDialog(false);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to the invoice.`,
    });
  };

  const handleRemoveItem = (index: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    toast({
      title: "Item Removed",
      description: "Item has been removed from the invoice.",
    });
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index] };
      item.quantity = quantity;
      item.total = item.price * quantity;
      updatedItems[index] = item;
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleUpdateItemDescription = (index: number, description: string) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        description
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleUpdateItemPrice = (index: number, price: number) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index] };
      item.price = price;
      item.total = price * item.quantity;
      updatedItems[index] = item;
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleAddLaborItem = (item: InvoiceItem) => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        item
      ]
    }));
    toast({
      title: "Labor Item Added",
      description: "Labor item has been added to the invoice.",
    });
  };

  // Staff management handlers
  const handleAddStaffMember = (staff: StaffMember) => {
    // Check if the staff member is already assigned
    const isAssigned = invoice.assignedStaff.some(existing => existing.id === staff.id);

    if (isAssigned) {
      toast({
        title: "Already Assigned",
        description: `${staff.name} is already assigned to this invoice.`,
        variant: "destructive",
      });
      return;
    }

    setInvoice((prev) => ({
      ...prev,
      assignedStaff: [...prev.assignedStaff, staff]
    }));
    
    setShowStaffDialog(false);
    toast({
      title: "Staff Assigned",
      description: `${staff.name} has been assigned to the invoice.`,
    });
  };

  const handleRemoveStaffMember = (staffId: string) => {
    setInvoice((prev) => ({
      ...prev,
      assignedStaff: prev.assignedStaff.filter(staff => staff.id !== staffId)
    }));
    
    toast({
      title: "Staff Removed",
      description: "Staff member has been removed from the invoice.",
    });
  };

  return {
    invoice,
    setInvoice,
    items: invoice.items,
    assignedStaff: invoice.assignedStaff,
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
