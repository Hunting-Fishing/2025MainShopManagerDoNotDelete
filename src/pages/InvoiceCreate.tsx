import { useParams } from "react-router-dom";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { supabase } from "@/lib/supabase"; 
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { WorkOrder } from "@/types/workOrder";
import { 
  InvoiceItem, 
  StaffMember, 
  InvoiceTemplate 
} from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  
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
      const formattedWorkOrders = workOrdersData.map((wo: any) => ({
        id: wo.id,
        customer: wo.customer || "",
        description: wo.description || "No description",
        status: wo.status || "",
        date: wo.created_at || "",
        dueDate: wo.due_date || "",
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
    if (inventoryData) {
      const formattedInventory = inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku || "",
        description: item.description || "",
        price: Number(item.unit_price) || 0,
        category: item.category || "",
        supplier: item.supplier || "",
        status: item.status || "",
        quantity: Number(item.quantity) || 0
      }));
      setInventoryItems(formattedInventory);
    }
    if (staffData) {
      const formattedStaff = staffData.map((staff: any) => ({
        id: staff.id || "",
        name: getStaffName(staff)
      }));
      setStaffMembers(formattedStaff);
    }
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

  const workOrderSelector = useWorkOrderSelector({
    invoice,
    setInvoice,
    handleSelectWorkOrder,
  });

  const handleSelectWorkOrderWithTime = workOrderSelector.handleSelectWorkOrderWithTime;

  const getStaffName = (staff: any) => {
    if (staff && staff.first_name && staff.last_name) {
      return `${staff.first_name} ${staff.last_name}`;
    }
    return "Unknown Staff";
  };

  const handleAddInventoryItemAdapter = (item: InventoryItem) => {
    const invoiceItem: InvoiceItem = {
      id: item.id,
      name: item.name,
      description: item.description || "",
      quantity: 1,
      price: item.price,
      total: item.price,
      sku: item.sku,
      category: item.category
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
      hours: true,
      sku: '',
      category: ''
    };
    handleAddLaborItem(laborItem);
  };

  const handleSaveTemplateAdapter = (templateNameOrObject: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => {
    if (typeof templateNameOrObject === 'string') {
      const template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount"> = {
        name: templateNameOrObject,
        description: `Template created from invoice on ${new Date().toLocaleDateString()}`,
        lastUsed: null,
        defaultTaxRate: taxRate,
        defaultDueDateDays: 30,
        defaultNotes: invoice.notes || "",
        defaultItems: invoice.items
      };
      handleSaveTemplate(template);
    } else {
      handleSaveTemplate(templateNameOrObject);
    }
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
      handleSaveTemplate={handleSaveTemplateAdapter}
    />
  );
}
