
import { useState, useEffect } from 'react';
import { createEmptyInvoice } from "@/data/invoiceCreateData";
import { Invoice, InvoiceItem, StaffMember, InvoiceTemplate } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';
import { InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { inventoryToInvoiceItem } from '@/utils/typeAdapters';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';

// Define a type for the update function
export type InvoiceUpdater = (invoice: Invoice) => Invoice;
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (invoice: Invoice) => ({ ...invoice, ...updates });
};

export function useInvoiceForm(workOrderId?: string) {
  const [invoice, setInvoice] = useState<Invoice>(createEmptyInvoice());
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0.0875); // 8.75% default
  const [total, setTotal] = useState(0);
  
  // Get templates from the templates hook
  const { templates, isLoading: templatesLoading, error: templatesError } = useInvoiceTemplates();

  // Use workOrderId to pre-populate if available
  useEffect(() => {
    if (workOrderId) {
      setShowWorkOrderDialog(true);
    }
  }, [workOrderId]);

  // Calculate totals whenever items change
  useEffect(() => {
    if (!invoice.items) return;
    
    const newSubtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [invoice.items, taxRate]);

  // Handle selecting a work order to add to the invoice
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    if (!workOrder) return;
    
    setInvoice((prevInvoice) => {
      const customer = workOrder.customer || "";
      const description = workOrder.description || "";
      
      return {
        ...prevInvoice,
        customer,
        customerAddress: "",
        customerEmail: "",
        customer_address: "",
        customer_email: "",
        description: `Work Order #${workOrder.id}: ${description}`,
        notes: prevInvoice.notes || `Reference: Work Order #${workOrder.id}`,
        related_work_order: workOrder.id,
        relatedWorkOrder: workOrder.id
      };
    });
    
    setShowWorkOrderDialog(false);
  };

  // Add inventory item to invoice
  const handleAddInventoryItem = (item: InvoiceItem) => {
    if (!item) return;

    setInvoice((prevInvoice) => {
      // Create a copy of items or initialize if undefined
      const updatedItems = [...(prevInvoice.items || [])];
      
      // Add the new item with UUID
      updatedItems.push({
        ...item,
        id: item.id || uuidv4(),
        quantity: item.quantity || 1,
        total: (item.quantity || 1) * (item.price || 0)
      });
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
    
    setShowInventoryDialog(false);
  };

  // Add a basic labor item
  const handleAddLaborItem = (laborItem: InvoiceItem) => {
    if (!laborItem) return;
    
    setInvoice((prevInvoice) => {
      const updatedItems = [...(prevInvoice.items || [])];
      
      updatedItems.push({
        ...laborItem,
        id: laborItem.id || uuidv4(),
        quantity: 1,
        price: 0,
        total: 0,
        hours: true
      });
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
  };

  // Remove an item from the invoice
  const handleRemoveItem = (id: string) => {
    setInvoice((prevInvoice) => {
      const updatedItems = (prevInvoice.items || []).filter(item => item.id !== id);
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
  };

  // Update an item's quantity
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setInvoice((prevInvoice) => {
      const updatedItems = (prevInvoice.items || []).map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, quantity);
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * (item.price || 0)
          };
        }
        return item;
      });
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
  };

  // Update an item's description
  const handleUpdateItemDescription = (id: string, description: string) => {
    setInvoice((prevInvoice) => {
      const updatedItems = (prevInvoice.items || []).map(item => {
        if (item.id === id) {
          return {
            ...item,
            description
          };
        }
        return item;
      });
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
  };

  // Update an item's price
  const handleUpdateItemPrice = (id: string, price: number) => {
    setInvoice((prevInvoice) => {
      const updatedItems = (prevInvoice.items || []).map(item => {
        if (item.id === id) {
          return {
            ...item,
            price,
            total: (item.quantity || 1) * price
          };
        }
        return item;
      });
      
      return {
        ...prevInvoice,
        items: updatedItems
      };
    });
  };

  // Add a staff member to the invoice
  const handleAddStaffMember = (staff: StaffMember) => {
    if (!staff) return;
    
    setInvoice((prevInvoice) => {
      // Initialize assignedStaff if it doesn't exist
      const currentStaff = prevInvoice.assignedStaff || [];
      
      // Don't add duplicates
      if (currentStaff.some(s => s.id === staff.id)) {
        return prevInvoice;
      }
      
      // Add the new staff member
      const updatedStaff = [...currentStaff, staff];
      
      return {
        ...prevInvoice,
        assignedStaff: updatedStaff
      };
    });
    
    setShowStaffDialog(false);
  };

  // Remove a staff member
  const handleRemoveStaffMember = (staffId: string) => {
    setInvoice((prevInvoice) => {
      const updatedStaff = (prevInvoice.assignedStaff || []).filter(staff => staff.id !== staffId);
      
      return {
        ...prevInvoice,
        assignedStaff: updatedStaff
      };
    });
  };

  // Save the invoice
  const handleSaveInvoice = async (status: Invoice['status']) => {
    try {
      // In a real app, we would send to an API
      const saveableInvoice = {
        ...invoice,
        status,
        subtotal,
        tax,
        tax_rate: taxRate,
        taxRate,
        total
      };
      
      console.log("Saving invoice:", saveableInvoice);
      
      toast.success(`Invoice ${status === 'draft' ? 'saved as draft' : 'created'}`);
      
      // In a real app, we would navigate to the invoice view page here
      return saveableInvoice;
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
      return null;
    }
  };

  // Apply a template to the invoice
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    if (!template) return;
    
    setInvoice((prevInvoice) => {
      // Add template items to current items
      const currentItems = prevInvoice.items || [];
      const templateItems = template.defaultItems || [];
      
      // Add items from template with new UUIDs
      const itemsToAdd = templateItems.map(item => ({
        ...item,
        id: uuidv4()
      }));
      
      return {
        ...prevInvoice,
        items: [...currentItems, ...itemsToAdd],
        notes: template.defaultNotes || template.default_notes || prevInvoice.notes
      };
    });
    
    // Apply the tax rate from template
    setTaxRate(template.defaultTaxRate || template.default_tax_rate || taxRate);
    
    toast.info(`Applied template: ${template.name}`);
  };

  // Save current invoice as a template
  const handleSaveTemplate = (templateData: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    // In a real app, we would save this to an API
    console.log("Saving template:", templateData);
    toast.success(`Template "${templateData.name}" saved`);
  };

  return {
    invoice,
    subtotal,
    tax,
    taxRate,
    total,
    showWorkOrderDialog,
    showInventoryDialog,
    showStaffDialog,
    templates,
    setInvoice,
    setShowWorkOrderDialog,
    setShowInventoryDialog,
    setShowStaffDialog,
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
  };
}
