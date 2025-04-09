
import React from "react";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceLeftColumn } from "@/components/invoices/layout/InvoiceLeftColumn";
import { InvoiceRightColumn } from "@/components/invoices/layout/InvoiceRightColumn";
import { Invoice, InvoiceTemplate, StaffMember } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { createInvoiceUpdater } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";

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
        <InvoiceLeftColumn 
          invoice={invoice}
          workOrders={workOrders}
          inventoryItems={inventoryItems}
          templates={templates}
          showWorkOrderDialog={showWorkOrderDialog}
          showInventoryDialog={showInventoryDialog}
          setInvoice={setInvoice}
          setShowWorkOrderDialog={setShowWorkOrderDialog}
          setShowInventoryDialog={setShowInventoryDialog}
          handleSelectWorkOrder={handleSelectWorkOrder}
          handleAddInventoryItem={handleAddInventoryItem}
          handleRemoveItem={handleRemoveItem}
          handleUpdateItemQuantity={handleUpdateItemQuantity}
          handleUpdateItemDescription={handleUpdateItemDescription}
          handleUpdateItemPrice={handleUpdateItemPrice}
          handleAddLaborItem={handleAddLaborItem}
          handleApplyTemplate={handleApplyTemplate}
          handleSaveTemplate={handleSaveTemplate}
        />
        
        {/* Right Column - Summary and Staff */}
        <InvoiceRightColumn 
          createdBy={invoice.createdBy}
          assignedStaff={invoice.assignedStaff}
          staffMembers={staffMembers}
          subtotal={subtotal}
          taxRate={taxRate}
          tax={tax}
          total={total}
          showStaffDialog={showStaffDialog}
          setShowStaffDialog={setShowStaffDialog}
          onCreatedByChange={(value) => setInvoice(createInvoiceUpdater({ createdBy: value }))}
          onAddStaffMember={handleAddStaffMember}
          onRemoveStaffMember={handleRemoveStaffMember}
        />
      </div>
    </div>
  );
}
