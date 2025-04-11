
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
    // Convert string IDs to StaffMember objects if needed
    if (Array.isArray(invoice.assignedStaff)) {
      const staffMembers = invoice.assignedStaff.map(staff => {
        if (typeof staff === 'string') {
          return { id: staff, name: staff } as StaffMember;
        }
        return staff as StaffMember;
      });
      setAssignedStaff(staffMembers);
    }
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
      setInvoice(prev => {
        // Ensure staff member is a proper StaffMember object
        const updatedStaff = [...prev.assignedStaff, staffMember];
        return {
          ...prev,
          assignedStaff: updatedStaff
        };
      });
    }
  };

  // Remove staff member
  const handleRemoveStaffMember = (staffId: string) => {
    setInvoice(prev => {
      const updatedStaff = prev.assignedStaff.filter(staff => {
        if (typeof staff === 'string') {
          return staff !== staffId;
        } else {
          return staff.id !== staffId;
        }
      });
      return {
        ...prev,
        assignedStaff: updatedStaff
      };
    });
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
