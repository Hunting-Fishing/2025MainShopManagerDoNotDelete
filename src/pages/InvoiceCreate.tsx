
import { useParams } from "react-router-dom";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useStaff } from "@/hooks/useStaff";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Invoice } from "@/types/invoice";

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  
  // Get work orders data
  const { workOrders } = useWorkOrders();
  
  // Get staff data
  const { staff } = useStaff();
  
  // Get templates data
  const { templates, handleApplyTemplate, handleSaveTemplate } = useInvoiceTemplates();
  
  // Create invoice data
  const {
    invoice,
    items,
    setInvoice,
    setItems,
    showWorkOrderDialog,
    showInventoryDialog,
    showStaffDialog,
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
    subtotal,
    tax,
    taxRate,
    total
  } = useInvoiceData(workOrderId);

  // Create a complete invoice object with items included
  const completeInvoice: Invoice = {
    ...invoice,
    items: items,
    number: invoice.number || `INV-${Date.now().toString().slice(-6)}`,
    id: invoice.id || uuidv4()
  };

  return (
    <InvoiceCreateLayout
      invoice={completeInvoice}
      subtotal={subtotal}
      tax={tax}
      taxRate={taxRate}
      total={total}
      items={items}
      showWorkOrderDialog={showWorkOrderDialog}
      showInventoryDialog={showInventoryDialog}
      showStaffDialog={showStaffDialog}
      workOrders={workOrders}
      inventoryItems={[]} // We're not loading inventory items yet
      staffMembers={staff}
      templates={templates}
      setInvoice={setInvoice}
      setShowWorkOrderDialog={setShowWorkOrderDialog}
      setShowInventoryDialog={setShowInventoryDialog}
      setShowStaffDialog={setShowStaffDialog}
      handleSelectWorkOrder={handleSelectWorkOrder}
      handleAddInventoryItem={handleAddInventoryItem}
      handleAddStaffMember={handleAddStaffMember}
      handleRemoveStaffMember={handleRemoveStaffMember}
      handleRemoveItem={handleRemoveItem}
      handleUpdateItemQuantity={handleUpdateItemQuantity}
      handleUpdateItemDescription={handleUpdateItemDescription}
      handleUpdateItemPrice={handleUpdateItemPrice}
      handleAddLaborItem={handleAddLaborItem}
      handleSaveInvoice={handleSaveInvoice}
      handleApplyTemplate={handleApplyTemplate}
      handleSaveTemplate={handleSaveTemplate}
      onTaxRateChange={(rate) => {
        setInvoice(prev => ({
          ...prev,
          tax_rate: rate
        }));
      }}
    />
  );
}
