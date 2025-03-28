
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createInvoiceFromWorkOrder } from "@/utils/workOrderUtils";

interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: string;
  date: string;
  dueDate: string;
  priority: string;
  technician: string;
  location: string;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export function useInvoiceForm(initialWorkOrderId?: string) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);

  // Form state
  const [invoice, setInvoice] = useState({
    id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    customer: "",
    customerAddress: "",
    customerEmail: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    workOrderId: initialWorkOrderId || "",
    createdBy: "",
    assignedStaff: [] as string[],
    items: [] as InvoiceItem[],
  });

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax rate - this could be configurable
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Handle selecting a work order
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    setInvoice(prev => ({
      ...prev,
      workOrderId: workOrder.id,
      customer: workOrder.customer,
      description: workOrder.description,
      assignedStaff: [workOrder.technician].filter(t => t !== "Unassigned")
    }));
    setShowWorkOrderDialog(false);
  };

  // Handle adding an inventory item
  const handleAddInventoryItem = (item: {id: string; name: string; description?: string; price: number}) => {
    // Check if item already exists
    const existingItem = invoice.items.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if already exists
      setInvoice(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id 
            ? { 
                ...i, 
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.price
              } 
            : i
        )
      }));
    } else {
      // Add new item
      setInvoice(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: item.id,
            name: item.name,
            description: item.description || "",
            quantity: 1,
            price: item.price,
            total: item.price
          }
        ]
      }));
    }
    
    setShowInventoryDialog(false);
  };

  // Handle adding staff member
  const handleAddStaffMember = (staffMember: StaffMember) => {
    if (!invoice.assignedStaff.includes(staffMember.name)) {
      setInvoice(prev => ({
        ...prev,
        assignedStaff: [...prev.assignedStaff, staffMember.name]
      }));
    }
    setShowStaffDialog(false);
  };

  // Handle removing staff member
  const handleRemoveStaffMember = (name: string) => {
    setInvoice(prev => ({
      ...prev,
      assignedStaff: prev.assignedStaff.filter(staff => staff !== name)
    }));
  };

  // Handle removing an item
  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Handle updating item quantity
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { ...item, quantity, total: quantity * item.price } 
          : item
      )
    }));
  };

  // Handle updating item description
  const handleUpdateItemDescription = (id: string, description: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { ...item, description } 
          : item
      )
    }));
  };

  // Handle updating item price
  const handleUpdateItemPrice = (id: string, price: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { ...item, price, total: item.quantity * price } 
          : item
      )
    }));
  };

  // Handle adding labor item
  const handleAddLaborItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `labor-${Date.now()}`,
          name: "Service Labor",
          description: "Technician hours",
          quantity: 1,
          price: 100, // Default labor rate
          total: 100
        }
      ]
    }));
  };

  // Handle saving invoice
  const handleSaveInvoice = async (status: string) => {
    if (!invoice.customer || !invoice.items.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // If this invoice is created from a work order, use that function
      if (invoice.workOrderId) {
        await createInvoiceFromWorkOrder(invoice.workOrderId, {
          ...invoice,
          status,
          subtotal,
          tax,
          total,
        });
      } else {
        // In a real app, this would be an API call to create a new invoice
        console.log("Creating new invoice:", {
          ...invoice,
          status,
          subtotal,
          tax,
          total,
        });
      }
      
      // Show success message
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoice.id} has been created successfully.`,
      });
      
      // Navigate to invoices list
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    invoice,
    subtotal,
    tax,
    taxRate,
    total,
    isSubmitting,
    showWorkOrderDialog,
    showInventoryDialog,
    showStaffDialog,
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
  };
}
