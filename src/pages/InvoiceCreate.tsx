
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { fetchWorkOrders, fetchInventoryItems, fetchStaffMembers } from "@/data/invoiceCreateData";
import { useState, useEffect } from "react";
import { InvoiceItem, InventoryItem } from "@/types/invoice";

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

  // Adapter functions to match expected types
  const handleAddInventoryItemAdapter = (item: InventoryItem) => {
    const invoiceItem: InvoiceItem = {
      id: item.id || crypto.randomUUID(),
      name: item.name,
      description: item.description || "",
      quantity: 1,
      price: item.price || 0,
      total: item.price || 0
    };
    handleAddInventoryItem(invoiceItem);
  };

  const handleRemoveItemAdapter = (id: string) => {
    const index = invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      handleRemoveItem(index);
    }
  };

  const handleUpdateItemQuantityAdapter = (id: string, quantity: number) => {
    const index = invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      handleUpdateItemQuantity(index, quantity);
    }
  };

  const handleUpdateItemDescriptionAdapter = (id: string, description: string) => {
    const index = invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      handleUpdateItemDescription(index, description);
    }
  };

  const handleUpdateItemPriceAdapter = (id: string, price: number) => {
    const index = invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      handleUpdateItemPrice(index, price);
    }
  };

  const handleAddLaborItemAdapter = () => {
    const laborItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name: "Labor",
      description: "Service labor",
      quantity: 1,
      price: 0,
      total: 0,
      hours: true
    };
    handleAddLaborItem(laborItem);
  };

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
      handleAddInventoryItem={handleAddInventoryItemAdapter}
      handleAddStaffMember={handleAddStaffMember}
      handleRemoveStaffMember={handleRemoveStaffMember}
      handleRemoveItem={handleRemoveItemAdapter}
      handleUpdateItemQuantity={handleUpdateItemQuantityAdapter}
      handleUpdateItemDescription={handleUpdateItemDescriptionAdapter}
      handleUpdateItemPrice={handleUpdateItemPriceAdapter}
      handleAddLaborItem={handleAddLaborItemAdapter}
      handleSaveInvoice={handleSaveInvoice}
      handleApplyTemplate={handleApplyTemplate}
      handleSaveTemplate={handleSaveTemplate}
    />
  );
}
