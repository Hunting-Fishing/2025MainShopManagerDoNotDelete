
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { supabase } from "@/lib/supabase"; 
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const [workOrders, setWorkOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  
  // Fetch real data from Supabase
  const { data: workOrdersData } = useQuery({
    queryKey: ['workOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: staffData } = useQuery({
    queryKey: ['staffMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, job_title');
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (workOrdersData) setWorkOrders(workOrdersData);
    if (inventoryData) setInventoryItems(inventoryData);
    if (staffData) setStaffMembers(staffData);
  }, [workOrdersData, inventoryData, staffData]);

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

  // Format staff names correctly
  const getStaffName = (staff: any) => {
    if (staff && staff.first_name && staff.last_name) {
      return `${staff.first_name} ${staff.last_name}`;
    }
    return "Unknown Staff";
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
