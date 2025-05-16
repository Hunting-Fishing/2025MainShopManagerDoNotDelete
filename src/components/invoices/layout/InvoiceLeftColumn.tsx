
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InvoiceItemsTable } from "../InvoiceItemsTable";
import { InvoiceTemplateActions } from "../InvoiceTemplateActions";
import { WorkOrderSelector } from "../WorkOrderSelector";
import { InventoryItemSelector } from "../InventoryItemSelector";
import { InventoryItem } from '@/types/inventory';

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  showWorkOrderDialog: boolean;
  setShowWorkOrderDialog: React.Dispatch<React.SetStateAction<boolean>>;
  workOrders: WorkOrder[];
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  showInventoryDialog: boolean;
  setShowInventoryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  inventoryItems: InventoryItem[];
  handleAddInventoryItem: (item: InvoiceItem) => void;
  templates: InvoiceTemplate[];
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => Promise<void>;
}

export function InvoiceLeftColumn({
  invoice,
  setInvoice,
  subtotal,
  tax,
  taxRate,
  total,
  handleRemoveItem,
  handleUpdateItemQuantity,
  handleUpdateItemDescription,
  handleUpdateItemPrice,
  handleAddLaborItem,
  showWorkOrderDialog,
  setShowWorkOrderDialog,
  workOrders,
  handleSelectWorkOrder,
  showInventoryDialog,
  setShowInventoryDialog,
  inventoryItems,
  handleAddInventoryItem,
  templates,
  handleApplyTemplate,
  handleSaveTemplate
}: InvoiceLeftColumnProps) {
  
  // Handler for updating invoice notes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  // Handler for adding a new work order to the invoice
  const handleSelectWorkOrderForInvoice = (workOrder: WorkOrder) => {
    // Update invoice customer information if needed
    if (!invoice.customer || invoice.customer === "New Customer") {
      setInvoice(prev => ({
        ...prev,
        customer: workOrder.customer || "Unknown Customer",
        work_order_id: workOrder.id
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        work_order_id: workOrder.id
      }));
    }

    // Add work order items to invoice if they exist
    if (workOrder.inventory_items && workOrder.inventory_items.length > 0) {
      const newItems = workOrder.inventory_items.map(item => ({
        id: crypto.randomUUID(),
        name: item.name,
        description: item.name,
        quantity: item.quantity,
        price: item.unit_price,
        total: item.quantity * item.unit_price,
        sku: item.sku,
        category: item.category || 'Parts'
      }));

      setInvoice(prev => ({
        ...prev,
        items: [...prev.items, ...newItems]
      }));
    }

    handleSelectWorkOrder(workOrder);
    setShowWorkOrderDialog(false);
  };

  // Handler for adding inventory item to invoice
  const handleAddInventoryItemToInvoice = (item: InventoryItem) => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name: item.name,
      description: item.description || item.name,
      quantity: 1,
      price: item.price || item.unit_price,
      total: item.price || item.unit_price,
      sku: item.sku || "",
      category: item.category || ""
    };

    handleAddInventoryItem(newItem);
    setShowInventoryDialog(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Invoice Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Invoice Items</h3>
          <InvoiceTemplateActions 
            invoice={invoice} 
            taxRate={taxRate} 
            templates={templates}
            onSelectTemplate={handleApplyTemplate} 
            onSaveTemplate={handleSaveTemplate} 
          />
        </div>
        <Separator />
      </div>

      {/* Invoice Items Table */}
      <InvoiceItemsTable 
        items={invoice.items} 
        onRemoveItem={handleRemoveItem}
        onUpdateItemQuantity={handleUpdateItemQuantity}
        onUpdateItemDescription={handleUpdateItemDescription}
        onUpdateItemPrice={handleUpdateItemPrice}
      />

      {/* Add Item Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowWorkOrderDialog(true)}
        >
          Link Work Order
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowInventoryDialog(true)}
        >
          Add Inventory Item
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddLaborItem}
        >
          Add Labor Item
        </Button>
      </div>

      {/* Item Selection Dialogs */}
      <WorkOrderSelector
        isOpen={showWorkOrderDialog}
        onClose={() => setShowWorkOrderDialog(false)}
        onSelectWorkOrder={handleSelectWorkOrderForInvoice}
        workOrders={workOrders}
      />
      
      <InventoryItemSelector
        isOpen={showInventoryDialog}
        onClose={() => setShowInventoryDialog(false)}
        onSelect={handleAddInventoryItemToInvoice}
        inventoryItems={inventoryItems}
        templates={templates}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Footer */}
      <div className="w-full space-y-6">
        <div className="px-4 py-6 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Invoice Notes</h3>
          <textarea
            className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm"
            placeholder="Add notes to your invoice (terms, payment instructions, etc.)"
            value={invoice.notes || ""}
            onChange={handleNotesChange}
          />
        </div>
      </div>
    </div>
  );
}
