
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { createInvoiceUpdater } from "@/types/invoice";

// Import components
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceInformationForm } from "@/components/invoices/InvoiceInformationForm";
import { WorkOrderLinkSection } from "@/components/invoices/WorkOrderLinkSection";
import { InvoiceItemsManager } from "@/components/invoices/InvoiceItemsManager";
import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import { StaffAssignment } from "@/components/invoices/StaffAssignment";
import { InvoiceTemplateActions } from "@/components/invoices/InvoiceTemplateActions";
import { WorkOrder } from "@/types/invoice";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";
import { v4 as uuidv4 } from "uuid";

// Mock data for work orders with time entries
const workOrders: WorkOrder[] = [
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
    timeEntries: [
      {
        id: "TE-001",
        employeeId: "EMP-001",
        employeeName: "Michael Brown",
        startTime: "2023-08-15T09:00:00Z",
        endTime: "2023-08-15T11:30:00Z",
        duration: 150, // 2.5 hours in minutes
        notes: "Initial diagnostic and repair work",
        billable: true
      },
      {
        id: "TE-002",
        employeeId: "EMP-001",
        employeeName: "Michael Brown",
        startTime: "2023-08-16T13:00:00Z",
        endTime: "2023-08-16T15:00:00Z",
        duration: 120, // 2 hours in minutes
        notes: "Completed system repair and testing",
        billable: true
      }
    ],
    totalBillableTime: 270 // 4.5 hours in minutes
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
  } = useInvoiceForm(workOrderId);

  // Custom handler to select work order and include time entries
  const handleSelectWorkOrderWithTime = (workOrder: WorkOrder) => {
    // First handle basic work order selection
    handleSelectWorkOrder(workOrder);
    
    // Add billed time to invoice items if present
    if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
      // Get billable entries and group by employee
      const billableEntries = workOrder.timeEntries.filter(entry => entry.billable);
      
      if (billableEntries.length > 0) {
        // Group entries by employee
        const employeeTimeMap: Record<string, number> = {};
        
        billableEntries.forEach(entry => {
          if (!employeeTimeMap[entry.employeeName]) {
            employeeTimeMap[entry.employeeName] = 0;
          }
          employeeTimeMap[entry.employeeName] += entry.duration;
        });
        
        // Add labor items for each employee
        Object.entries(employeeTimeMap).forEach(([employee, minutes]) => {
          // Convert minutes to hours for billing
          const hours = minutes / 60;
          
          // Standard labor rate of $75/hour
          const laborRate = 75;
          
          // Create labor item
          const laborItem = {
            id: uuidv4(),
            name: `Labor - ${employee}`,
            description: `Service labor (${formatTimeInHoursAndMinutes(minutes)})`,
            quantity: parseFloat(hours.toFixed(2)),
            price: laborRate,
            total: parseFloat((hours * laborRate).toFixed(2)),
            hours: true
          };
          
          // Add to invoice items
          setInvoice(createInvoiceUpdater({
            items: [...invoice.items, laborItem]
          }));
        });
      }
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
          {/* Template Actions Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Invoice Templates</h2>
              <InvoiceTemplateActions 
                invoice={invoice}
                taxRate={taxRate}
                templates={templates}
                onSelectTemplate={handleApplyTemplate}
                onSaveTemplate={handleSaveTemplate}
              />
            </div>
          </div>
          
          {/* Invoice Information */}
          <InvoiceInformationForm
            // Basic info props
            invoiceId={invoice.id}
            status={invoice.status}
            date={invoice.date}
            dueDate={invoice.dueDate}
            onInvoiceIdChange={(value) => setInvoice(createInvoiceUpdater({ id: value }))}
            onStatusChange={(value) => setInvoice(createInvoiceUpdater({ status: value }))}
            onDateChange={(value) => setInvoice(createInvoiceUpdater({ date: value }))}
            onDueDateChange={(value) => setInvoice(createInvoiceUpdater({ dueDate: value }))}
            
            // Customer info props
            customer={invoice.customer}
            customerAddress={invoice.customerAddress}
            customerEmail={invoice.customerEmail}
            onCustomerChange={(value) => setInvoice(createInvoiceUpdater({ customer: value }))}
            onCustomerAddressChange={(value) => setInvoice(createInvoiceUpdater({ customerAddress: value }))}
            onCustomerEmailChange={(value) => setInvoice(createInvoiceUpdater({ customerEmail: value }))}
            
            // Description and notes props
            description={invoice.description}
            notes={invoice.notes}
            onDescriptionChange={(value) => setInvoice(createInvoiceUpdater({ description: value }))}
            onNotesChange={(value) => setInvoice(createInvoiceUpdater({ notes: value }))}
          />
          
          {/* Work Order Reference */}
          <WorkOrderLinkSection
            workOrderId={invoice.workOrderId}
            description={invoice.description}
            workOrders={workOrders}
            onSelectWorkOrder={handleSelectWorkOrderWithTime}
            onClearWorkOrder={() => setInvoice(createInvoiceUpdater({ workOrderId: "" }))}
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
            onCreatedByChange={(value) => setInvoice(createInvoiceUpdater({ createdBy: value }))}
            onAddStaffMember={handleAddStaffMember}
            onRemoveStaffMember={handleRemoveStaffMember}
          />
        </div>
      </div>
    </div>
  );
}
