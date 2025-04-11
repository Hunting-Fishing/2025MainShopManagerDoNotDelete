
import { useState, useEffect } from 'react';
import { createDefaultInvoice } from '@/utils/invoiceUtils';
import { Invoice, InvoiceItem, StaffMember } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

export function useInvoiceFormState(initialWorkOrderId?: string) {
  const [invoice, setInvoice] = useState<Invoice>(() => createDefaultInvoice(initialWorkOrderId));
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);

  // Initialize items and assignedStaff from invoice when it changes
  useEffect(() => {
    setItems(invoice.items || []);
    setAssignedStaff(invoice.assignedStaff || []);
  }, [invoice]);

  // Add inventory item
  const handleAddInventoryItem = (item: InvoiceItem) => {
    const newItem = {
      ...item,
      id: item.id || uuidv4(),
      total: item.price * (item.quantity || 1)
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item quantity
  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    setInvoice(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total: updatedItems[index].price * quantity
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Update item description
  const handleUpdateItemDescription = (index: number, description: string) => {
    setInvoice(prev => {
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

  // Update item price
  const handleUpdateItemPrice = (index: number, price: number) => {
    setInvoice(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        price,
        total: price * updatedItems[index].quantity
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Add labor item
  const handleAddLaborItem = (item: InvoiceItem) => {
    handleAddInventoryItem({
      ...item,
      hours: true
    });
  };

  // Add staff member
  const handleAddStaffMember = (staffMember: StaffMember) => {
    const staffExists = assignedStaff.some(staff => staff.id === staffMember.id);
    if (!staffExists) {
      setInvoice(prev => ({
        ...prev,
        assignedStaff: [...prev.assignedStaff, staffMember]
      }));
    }
  };

  // Remove staff member
  const handleRemoveStaffMember = (staffId: string) => {
    setInvoice(prev => ({
      ...prev,
      assignedStaff: prev.assignedStaff.filter(staff => staff.id !== staffId)
    }));
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
}
