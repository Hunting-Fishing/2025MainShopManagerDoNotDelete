import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceCreateLayout } from "@/components/invoices/InvoiceCreateLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getWorkOrders,
  WorkOrder
} from "@/services/work-orders";
import { 
  getInventoryItems,
  InventoryItem
} from "@/services/inventory";
import { 
  getStaffMembers,
  StaffMember
} from "@/services/staff";
import { 
  getInvoiceTemplates,
  createInvoice,
  updateInvoice,
  saveInvoiceTemplate
} from "@/services/invoices";
import { 
  Invoice, 
  InvoiceItem, 
  InvoiceTemplate,
  createInvoiceUpdater
} from "@/types/invoice";
import { generateInvoiceId } from "@/utils/invoices";

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State variables
  const [invoice, setInvoice] = useState<Invoice>({
    id: generateInvoiceId(),
    customer: '',
    date: new Date().toISOString().split('T')[0],
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [],
    notes: '',
    terms: '',
    tax_rate: 0,
    tax: 0,
    subtotal: 0,
    total: 0,
    created_by: '',
    assignedStaff: [],
    template_id: null
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
  // Data fetching queries
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>('workOrders', getWorkOrders);
  const { data: inventoryItems, isLoading: isLoadingInventoryItems } = useQuery<InventoryItem[]>('inventoryItems', getInventoryItems);
  const { data: staffMembers, isLoading: isLoadingStaffMembers } = useQuery<StaffMember[]>('staffMembers', getStaffMembers);
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<InvoiceTemplate[]>('invoiceTemplates', getInvoiceTemplates);
  
  // Mutations
  const createInvoiceMutation = useMutation(createInvoice, {
    onSuccess: () => {
      toast({
        title: "Invoice created",
        description: "Your invoice has been successfully created.",
      });
      queryClient.invalidateQueries('invoices');
      navigate('/invoices');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice.",
        variant: "destructive",
      });
    },
  });
  
  const updateInvoiceMutation = useMutation(updateInvoice, {
    onSuccess: () => {
      toast({
        title: "Invoice updated",
        description: "Your invoice has been successfully updated.",
      });
      queryClient.invalidateQueries('invoices');
      navigate('/invoices');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice.",
        variant: "destructive",
      });
    },
  });
  
  const saveTemplateMutation = useMutation(saveInvoiceTemplate, {
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: "Your invoice template has been successfully saved.",
      });
      queryClient.invalidateQueries('invoiceTemplates');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save invoice template.",
        variant: "destructive",
      });
    },
  });
  
  // Recalculate totals whenever items or tax rate changes
  const recalculateTotals = useCallback(() => {
    let newSubtotal = 0;
    items.forEach(item => {
      newSubtotal += item.price * item.quantity;
    });
    setSubtotal(newSubtotal);
    
    const newTax = newSubtotal * (taxRate / 100);
    setTax(newTax);
    
    setTotal(newSubtotal + newTax);
  }, [items, taxRate]);
  
  useEffect(() => {
    recalculateTotals();
  }, [recalculateTotals]);
  
  // Handlers
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    setInvoice(createInvoiceUpdater({
      customer: workOrder.customer,
      notes: workOrder.description,
    }));
    setShowWorkOrderDialog(false);
  };

  // Inside the InvoiceCreate component
  // Modify the handleAddInventoryItem function:

  const handleAddInventoryItem = (inventoryItem: InventoryItem) => {
    // Convert inventory item to invoice item
    const invoiceItem: InvoiceItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      description: inventoryItem.description || inventoryItem.name,
      sku: inventoryItem.sku || '',
      quantity: 1,
      price: inventoryItem.price || 0,
      total: inventoryItem.price || 0,
      category: inventoryItem.category || ''
    };
    
    setItems((prevItems) => [...prevItems, invoiceItem]);
  };
  
  const handleAddLaborItem = () => {
    const newLaborItem: InvoiceItem = {
      id: uuidv4(),
      name: 'Labor',
      description: 'Hourly labor',
      sku: 'LABOR',
      quantity: 1,
      price: 50,
      total: 50,
      category: 'Services'
    };
    setItems(prevItems => [...prevItems, newLaborItem]);
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity, total: item.price * quantity } : item
      )
    );
  };
  
  const handleUpdateItemDescription = (id: string, description: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, description } : item
      )
    );
  };
  
  const handleUpdateItemPrice = (id: string, price: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, price, total: price * item.quantity } : item
      )
    );
  };
  
  const handleAddStaffMember = (staff: StaffMember) => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      assignedStaff: [...(prevInvoice.assignedStaff || []), staff]
    }));
    setShowStaffDialog(false);
  };
  
  const handleRemoveStaffMember = (staffId: string) => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      assignedStaff: (prevInvoice.assignedStaff || []).filter(staff => staff.id !== staffId)
    }));
  };
  
  const handleSaveInvoice = async (status: "draft" | "pending" | "paid" | "overdue" | "cancelled") => {
    const invoiceData = {
      ...invoice,
      status: status,
      items: items,
      subtotal: subtotal,
      tax_rate: taxRate,
      tax: tax,
      total: total
    };
    
    try {
      if (invoice.id) {
        await updateInvoiceMutation.mutateAsync(invoiceData);
      } else {
        await createInvoiceMutation.mutateAsync(invoiceData);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };
  
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    setInvoice(createInvoiceUpdater({
      template_id: template.id,
      notes: template.notes,
      terms: template.terms
    }));
    setTaxRate(template.tax_rate);
    setItems(template.items);
  };
  
  const handleSaveTemplate = async (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => {
    try {
      await saveTemplateMutation.mutateAsync({
        ...template,
        items: items,
        tax_rate: taxRate
      });
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };
  
  const onTaxRateChange = (value: number) => {
    setTaxRate(value);
  };

  return (
    <InvoiceCreateLayout
      invoice={invoice}
      subtotal={subtotal}
      tax={tax}
      taxRate={taxRate}
      total={total}
      items={items}
      showWorkOrderDialog={showWorkOrderDialog}
      showInventoryDialog={showInventoryDialog}
      showStaffDialog={showStaffDialog}
      workOrders={workOrders || []}
      inventoryItems={inventoryItems || []}
      staffMembers={staffMembers || []}
      templates={templates || []}
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
      onTaxRateChange={onTaxRateChange}
    />
  );
}
