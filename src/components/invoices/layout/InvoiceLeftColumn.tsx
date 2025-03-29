
import React from "react";
import { InvoiceInformationForm } from "@/components/invoices/InvoiceInformationForm";
import { WorkOrderLinkSection } from "@/components/invoices/WorkOrderLinkSection";
import { InvoiceItemsManager } from "@/components/invoices/InvoiceItemsManager";
import { InvoiceTemplateActions } from "@/components/invoices/InvoiceTemplateActions";
import { Invoice, InvoiceTemplate, WorkOrder } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { createInvoiceUpdater } from "@/types/invoice";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  setInvoice: (updater: any) => void;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InventoryItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
}

export function InvoiceLeftColumn({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  showWorkOrderDialog,
  showInventoryDialog,
  setInvoice,
  setShowWorkOrderDialog,
  setShowInventoryDialog,
  handleSelectWorkOrder,
  handleAddInventoryItem,
  handleRemoveItem,
  handleUpdateItemQuantity,
  handleUpdateItemDescription,
  handleUpdateItemPrice,
  handleAddLaborItem,
  handleApplyTemplate,
  handleSaveTemplate,
}: InvoiceLeftColumnProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Template Actions Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Invoice Templates</h2>
          <InvoiceTemplateActions 
            invoice={invoice}
            taxRate={0.08} // Default tax rate
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
  );
}
