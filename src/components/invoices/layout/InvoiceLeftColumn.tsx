import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { InventoryItemSelector } from "@/components/invoices/InventoryItemSelector";
import { StaffSelector } from "@/components/invoices/StaffSelector";
import { InvoiceItemList } from "@/components/invoices/InvoiceItemList";
import { SaveTemplateDialog } from "@/components/invoices/SaveTemplateDialog";
import {
  Invoice,
  StaffMember,
  InvoiceItem,
  InvoiceTemplate,
  createInvoiceUpdater
} from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  showStaffDialog: boolean;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  setShowStaffDialog: (show: boolean) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InventoryItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
}

export function InvoiceLeftColumn({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  showWorkOrderDialog,
  showInventoryDialog,
  showStaffDialog,
  setInvoice,
  setShowWorkOrderDialog,
  setShowInventoryDialog,
  setShowStaffDialog,
  handleSelectWorkOrder,
  handleAddInventoryItem,
  handleRemoveItem,
  handleUpdateItemQuantity,
  handleUpdateItemDescription,
  handleUpdateItemPrice,
  handleAddLaborItem,
  handleApplyTemplate,
  handleSaveTemplate,
}: InvoiceLeftColumnProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleClose = () => {
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={invoice.customer || ""}
                onChange={(e) => setInvoice(createInvoiceUpdater({ customer: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={invoice.date || ""}
                onChange={(e) => setInvoice(createInvoiceUpdater({ date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                value={invoice.due_date || ""}
                onChange={(e) => setInvoice(createInvoiceUpdater({ due_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                type="text"
                id="invoiceNumber"
                value={invoice.invoice_number || ""}
                onChange={(e) => setInvoice(createInvoiceUpdater({ invoice_number: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Invoice description..."
              value={invoice.description || ""}
              onChange={(e) => setInvoice(createInvoiceUpdater({ description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={invoice.notes || ""}
              onChange={(e) => setInvoice(createInvoiceUpdater({ notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Items & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowWorkOrderDialog(true)}>
              Select Work Order
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInventoryDialog(true)}>
              Add Inventory Item
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddLaborItem}>
              Add Labor
            </Button>
          </div>

          <WorkOrderSelector
            invoice={invoice}
            workOrders={workOrders}
            open={showWorkOrderDialog}
            onSelectWorkOrder={handleSelectWorkOrder}
            onClose={() => setShowWorkOrderDialog(false)}
          />

          <InventoryItemSelector
            inventoryItems={inventoryItems}
            open={showInventoryDialog}
            onSelect={handleAddInventoryItem}
            onClose={() => setShowInventoryDialog(false)}
            templates={templates}
            onApplyTemplate={handleApplyTemplate}
          />

          <SaveTemplateDialog
            invoice={invoice}
            taxRate={0.08}
            onSaveTemplate={handleSaveTemplate}
            onClose={handleClose}
            isOpen={showSaveDialog}
          />

          <StaffSelector
            staffMembers={[]}
            onSelect={() => {}}
            onClose={() => {}}
            open={false}
          />

          <InvoiceItemList
            items={invoice.items || []}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateItemQuantity}
            onUpdateDescription={handleUpdateItemDescription}
            onUpdatePrice={handleUpdateItemPrice}
          />

          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            Save as Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
