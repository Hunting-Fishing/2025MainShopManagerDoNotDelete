
import React from "react";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceInformationForm } from "@/components/invoices/InvoiceInformationForm";
import { WorkOrderLinkSection } from "@/components/invoices/WorkOrderLinkSection";
import { InvoiceItemsManager } from "@/components/invoices/InvoiceItemsManager";
import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import { StaffAssignment } from "@/components/invoices/StaffAssignment";
import { InvoiceTemplateActions } from "@/components/invoices/InvoiceTemplateActions";
import { Invoice, InvoiceTemplate, WorkOrder, StaffMember } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { createInvoiceUpdater } from "@/types/invoice";

interface InvoiceCreateLayoutProps {
  // Invoice data
  invoice: Invoice;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  
  // Dialogs state
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  showStaffDialog: boolean;
  
  // Mock data
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  staffMembers: StaffMember[];
  templates: InvoiceTemplate[];
  
  // Event handlers
  setInvoice: (updater: any) => void;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  setShowStaffDialog: (show: boolean) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InventoryItem) => void;
  handleAddStaffMember: (staffMember: StaffMember) => void;
  handleRemoveStaffMember: (name: string) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleSaveInvoice: (status: string) => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
}

export function InvoiceCreateLayout({
  invoice,
  subtotal,
  tax,
  taxRate,
  total,
  showWorkOrderDialog,
  showInventoryDialog,
  showStaffDialog,
  workOrders,
  inventoryItems,
  staffMembers,
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
}: InvoiceCreateLayoutProps) {
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
            onSelectWorkOrder={handleSelectWorkOrder}
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
