
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";

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
  const {
    invoice,
    subtotal,
    tax,
    taxRate,
    total,
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
  } = useInvoiceForm(workOrderId);

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
