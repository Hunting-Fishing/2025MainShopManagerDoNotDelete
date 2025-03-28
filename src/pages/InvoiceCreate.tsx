import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { createInvoiceFromWorkOrder } from "@/utils/workOrderUtils";

// Import components
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceInformationForm } from "@/components/invoices/InvoiceInformationForm";
import { WorkOrderLinkSection } from "@/components/invoices/WorkOrderLinkSection";
import { InvoiceItemsManager } from "@/components/invoices/InvoiceItemsManager";
import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import { StaffAssignment } from "@/components/invoices/StaffAssignment";

// Mock data for work orders (in a real app would be fetched from API)
const workOrders = [
  {
    id: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    status: "in-progress",
    date: "2023-08-15",
    dueDate: "2023-08-20",
    priority: "high",
    technician: "Michael Brown",
    location: "123 Business Park, Suite 400",
  },
  {
    id: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    status: "pending",
    date: "2023-08-14",
    dueDate: "2023-08-22",
    priority: "medium",
    technician: "Unassigned",
    location: "456 Maple Street",
  },
  // more work orders...
];

// Mock data for inventory items (in a real app would be fetched from API)
const inventoryItems = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    price: 24.99,
    description: "High-efficiency particulate air filter",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    price: 18.75,
    description: "Standard copper pipe for plumbing installations",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    price: 42.50,
    description: "30 Amp circuit breaker for electrical panels",
  },
  // more inventory items...
];

// Mock data for staff members (in a real app would be fetched from API)
const staffMembers = [
  { id: 1, name: "Michael Brown", role: "Technician" },
  { id: 2, name: "Sarah Johnson", role: "Technician" },
  { id: 3, name: "David Lee", role: "Technician" },
  { id: 4, name: "Emily Chen", role: "Technician" },
  { id: 5, name: "James Wilson", role: "Office Manager" },
];

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const navigate = useNavigate();
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    workOrderId: workOrderId || "",
    createdBy: "",
    assignedStaff: [] as string[],
    items: [] as {
      id: string;
      name: string;
      description: string;
      quantity: number;
      price: number;
      total: number;
    }[],
  });

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax rate - this could be configurable
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Load work order data if workOrderId is provided
  useEffect(() => {
    if (workOrderId) {
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        setInvoice(prev => ({
          ...prev,
          workOrderId: workOrder.id,
          customer: workOrder.customer,
          description: workOrder.description,
          assignedStaff: [workOrder.technician].filter(t => t !== "Unassigned")
        }));
      }
    }
  }, [workOrderId]);

  // Handle selecting a work order
  const handleSelectWorkOrder = (workOrder: typeof workOrders[0]) => {
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
  const handleAddInventoryItem = (item: typeof inventoryItems[0]) => {
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
  const handleAddStaffMember = (staffMember: typeof staffMembers[0]) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <InvoiceHeader 
        onSaveAsDraft={() => handleSaveInvoice("draft")}
        onCreateInvoice={() => handleSaveInvoice("pending")}
      />
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <InvoiceInformationForm
            // Basic info props
            invoiceId={invoice.id}
            status={invoice.status}
            date={invoice.date}
            dueDate={invoice.dueDate}
            onInvoiceIdChange={(value) => setInvoice(prev => ({ ...prev, id: value }))}
            onStatusChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}
            onDateChange={(value) => setInvoice(prev => ({ ...prev, date: value }))}
            onDueDateChange={(value) => setInvoice(prev => ({ ...prev, dueDate: value }))}
            
            // Customer info props
            customer={invoice.customer}
            customerAddress={invoice.customerAddress}
            customerEmail={invoice.customerEmail}
            onCustomerChange={(value) => setInvoice(prev => ({ ...prev, customer: value }))}
            onCustomerAddressChange={(value) => setInvoice(prev => ({ ...prev, customerAddress: value }))}
            onCustomerEmailChange={(value) => setInvoice(prev => ({ ...prev, customerEmail: value }))}
            
            // Description and notes props
            description={invoice.description}
            notes={invoice.notes}
            onDescriptionChange={(value) => setInvoice(prev => ({ ...prev, description: value }))}
            onNotesChange={(value) => setInvoice(prev => ({ ...prev, notes: value }))}
          />
          
          {/* Work Order Reference */}
          <WorkOrderLinkSection
            workOrderId={invoice.workOrderId}
            description={invoice.description}
            workOrders={workOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
            onClearWorkOrder={() => setInvoice(prev => ({ ...prev, workOrderId: "" }))}
            showWorkOrderDialog={showWorkOrderDialog}
            setShowWorkOrderDialog={setShowWorkOrderDialog}
          />
          
          {/* Items */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <InvoiceItemsManager
              items={invoice.items}
              inventoryItems={inventoryItems}
              showInventoryDialog={showInventoryDialog}
              setShowInventoryDialog={setShowInventoryDialog}
              onAddInventoryItem={handleAddInventoryItem}
              onAddLaborItem={handleAddLaborItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItemQuantity={handleUpdateItemQuantity}
              onUpdateItemDescription={handleUpdateItemDescription}
              onUpdateItemPrice={handleUpdateItemPrice}
            />
          </div>
        </div>
        
        {/* Right Column - Summary and Staff */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <InvoiceSummary
            subtotal={subtotal}
            taxRate={taxRate}
            tax={tax}
            total={total}
          />
          
          {/* Staff Assignment */}
          <StaffAssignment
            createdBy={invoice.createdBy}
            assignedStaff={invoice.assignedStaff}
            staffMembers={staffMembers}
            showStaffDialog={showStaffDialog}
            setShowStaffDialog={setShowStaffDialog}
            onCreatedByChange={(value) => setInvoice(prev => ({ ...prev, createdBy: value }))}
            onAddStaffMember={handleAddStaffMember}
            onRemoveStaffMember={handleRemoveStaffMember}
          />
        </div>
      </div>
    </div>
  );
}
