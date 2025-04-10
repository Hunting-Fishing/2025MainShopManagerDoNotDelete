
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { fetchWorkOrders, fetchInventoryItems, fetchStaffMembers } from "@/data/invoiceCreateData";
import { useState, useEffect } from "react";

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const [workOrders, setWorkOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [workOrdersData, inventoryData, staffData] = await Promise.all([
          fetchWorkOrders(),
          fetchInventoryItems(),
          fetchStaffMembers()
        ]);
        
        setWorkOrders(workOrdersData);
        setInventoryItems(inventoryData);
        setStaffMembers(staffData);
      } catch (error) {
        console.error("Error loading invoice data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-500">Loading invoice data...</div>
      </div>
    );
  }

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
