
import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { supabase } from "@/lib/supabase"; 
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { WorkOrder } from "@/types/workOrder";

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
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
    if (workOrdersData) {
      // Format work orders to match the WorkOrder type
      const formattedWorkOrders = workOrdersData.map((wo: any) => ({
        id: wo.id,
        customer: wo.customer || "",
        description: wo.description || "No description", // Ensure description is never empty/undefined
        status: wo.status || "",
        date: wo.created_at || "",
        dueDate: wo.due_date || "", // Ensure dueDate is never empty/undefined
        priority: wo.priority || "medium",
        technician: wo.technician || "Unassigned",
        location: wo.location || "",
        notes: wo.notes,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        technician_id: wo.technician_id,
        total_cost: wo.total_cost,
        estimated_hours: wo.estimated_hours,
      }));
      setWorkOrders(formattedWorkOrders);
    }
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
