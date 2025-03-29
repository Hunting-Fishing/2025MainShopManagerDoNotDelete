
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { workOrders, inventoryItems, staffMembers } from "@/data/invoiceCreateMockData";

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

  // Handle work order selection with time entries
  const { handleSelectWorkOrderWithTime } = useWorkOrderSelector({
    invoice,
    setInvoice,
    handleSelectWorkOrder,
  });

  return (
    <InvoiceCreateLayout
      invoice={invoice}
      subtotal={subtotal}
      tax={tax}
      taxRate={taxRate}
      total={total}
      showWorkOrderDialog={showWorkOrderDialog}
      showInventoryDialog={showInventoryDialog}
      showStaffDialog={showStaffDialog}
      workOrders={workOrders}
      inventoryItems={inventoryItems}
      staffMembers={staffMembers}
      templates={templates}
      setInvoice={setInvoice}
      setShowWorkOrderDialog={setShowWorkOrderDialog}
      setShowInventoryDialog={setShowInventoryDialog}
      setShowStaffDialog={setShowStaffDialog}
      handleSelectWorkOrder={handleSelectWorkOrderWithTime}
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
    />
  );
}
