
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { useInvoice } from "@/hooks/useInvoice";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useInventory } from "@/hooks/useInventory";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";
import { useStaff } from "@/hooks/useStaff";
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoice();
  const { workOrders } = useWorkOrders();
  const { items: inventoryItems } = useInventory();
  const { templates, saveTemplate } = useInvoiceTemplates();
  const { staffMembers } = useStaff();

  // State for the invoice being created
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    customer: "",
    customer_email: "",
    customer_address: "",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    tax_rate: 0.0,
    total: 0,
    notes: "",
    status: "draft",
    work_order_id: "",
    created_by: "Current User",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignedStaff: [],
  });

  // UI state
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate subtotal, tax, and total whenever items change
  useEffect(() => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const tax = subtotal * invoice.tax_rate;
    const total = subtotal + tax;

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }));
  }, [invoice.items, invoice.tax_rate]);

  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    if (!workOrder) return;

    setInvoice((prev) => ({
      ...prev,
      customer: workOrder.customer || "",
      customer_address: workOrder.location || "",
      work_order_id: workOrder.id,
      description: workOrder.description || "",
      assignedStaff: workOrder.technician
        ? [{ id: workOrder.technician_id || "", name: workOrder.technician }]
        : [],
    }));
    setShowWorkOrderDialog(false);
  };

  const handleAddInventoryItem = (item: InvoiceItem) => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          name: item.name || "",
          description: item.description || "",
          quantity: 1,
          price: item.price,
          total: item.price,
        },
      ],
    }));
    setShowInventoryDialog(false);
  };

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, quantity, total: quantity * item.price } : item
      ),
    }));
  };

  const handleUpdateItemDescription = (id: string, description: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, description } : item
      ),
    }));
  };

  const handleUpdateItemPrice = (id: string, price: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, price, total: item.quantity * price } : item
      ),
    }));
  };

  const handleAddLaborItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          name: "Labor",
          description: "Labor hours",
          quantity: 1,
          price: 85,
          total: 85,
          hours: true,
        },
      ],
    }));
  };

  // Adapter function to convert InventoryItem to InvoiceItem
  const inventoryToInvoiceItem = (item: InventoryItem): InvoiceItem => {
    return {
      id: crypto.randomUUID(),
      name: item.name,
      description: item.description || "",
      quantity: 1,
      price: item.price || 0,
      total: item.price || 0,
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createInvoice(invoice);
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyTemplate = (template: InvoiceTemplate) => {
    if (!template) return;

    const templateItems = template.default_items || [];
    
    setInvoice((prev) => ({
      ...prev,
      tax_rate: template.default_tax_rate || prev.tax_rate,
      notes: template.default_notes || prev.notes,
      items: [
        ...prev.items,
        ...templateItems.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          total: (item.quantity || 1) * (item.price || 0),
        })),
      ],
    }));
  };

  const handleSaveTemplate = async (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => {
    try {
      const savedTemplate = await saveTemplate(template);
      return;
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <InvoiceForm
        invoice={invoice}
        setInvoice={setInvoice}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        showWorkOrderDialog={showWorkOrderDialog}
        setShowWorkOrderDialog={setShowWorkOrderDialog}
        showInventoryDialog={showInventoryDialog}
        setShowInventoryDialog={setShowInventoryDialog}
        showStaffDialog={showStaffDialog}
        setShowStaffDialog={setShowStaffDialog}
        workOrders={workOrders}
        inventoryItems={inventoryItems}
        templates={templates}
        staffMembers={staffMembers}
        onSelectWorkOrder={handleSelectWorkOrder}
        onAddInventoryItem={handleAddInventoryItem}
        onRemoveItem={handleRemoveItem}
        onUpdateItemQuantity={handleUpdateItemQuantity}
        onUpdateItemDescription={handleUpdateItemDescription}
        onUpdateItemPrice={handleUpdateItemPrice}
        onAddLaborItem={handleAddLaborItem}
        onApplyTemplate={handleApplyTemplate}
        onSaveTemplate={handleSaveTemplate}
      />
    </div>
  );
};

export default InvoiceCreate;
