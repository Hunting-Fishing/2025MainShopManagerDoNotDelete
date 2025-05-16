import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Invoice, InvoiceItem, InvoiceTemplate, createInvoiceUpdater } from "@/types/invoice";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Template } from "lucide-react";
import { WorkOrderSelector } from "../WorkOrderSelector";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItemSelector } from "../InventoryItemSelector";
import { InventoryItem } from "@/types/inventory";
import { InvoiceItemList } from "../InvoiceItemList";
import { InvoiceTemplateSelector } from "../InvoiceTemplateSelector";
import { SaveTemplateDialog } from "../templates/SaveTemplateDialog";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
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
  setInvoice,
  setShowWorkOrderDialog,
  setShowInventoryDialog,
  handleSelectWorkOrder,
  handleAddInventoryItem,
  handleRemoveItem,
  handleUpdateItemQuantity,
  handleUpdateItemDescription,
  handleUpdateItemPrice,
  handleAddLaborItem,
  handleApplyTemplate,
  handleSaveTemplate,
}: any) {  // Use any temporarily to avoid complex type issues
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(createInvoiceUpdater({ customer: e.target.value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(createInvoiceUpdater({ date: e.target.value }));
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(createInvoiceUpdater({ due_date: e.target.value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(createInvoiceUpdater({ notes: e.target.value }));
  };

  const handleItemQuantityChange = (id: string, quantity: number) => {
    handleUpdateItemQuantity(id, quantity);
  };

  const handleItemDescriptionChange = (id: string, description: string) => {
    handleUpdateItemDescription(id, description);
  };

  const handleItemPriceChange = (id: string, price: number) => {
    handleUpdateItemPrice(id, price);
  };

  const handleAddItem = (item: InvoiceItem) => {
    setInvoice((prev) => {
      const updatedItems = [...(prev.items || []), item];
      return { ...prev, items: updatedItems };
    });
  };

  return (
    <div className="col-span-2 space-y-4">
      {/* Customer Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={invoice.customer || ""}
              onChange={handleCustomerChange}
              placeholder="Enter customer name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={invoice.date || ""}
              onChange={handleDateChange}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={invoice.due_date || ""}
              onChange={handleDueDateChange}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Invoice notes"
              value={invoice.notes || ""}
              onChange={handleNotesChange}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplateSelector(true)}
            >
              <Template className="mr-2 h-4 w-4" />
              Apply Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplateDialog(true)}
            >
              Save as Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceItemList
            items={invoice.items || []}
            onRemoveItem={handleRemoveItem}
            onQuantityChange={handleItemQuantityChange}
            onDescriptionChange={handleItemDescriptionChange}
            onPriceChange={handleItemPriceChange}
          />
          <div className="flex justify-between items-center mt-4">
            <Button onClick={handleAddLaborItem}>Add Labor</Button>
            <div>
              <Button
                variant="outline"
                onClick={() => setShowWorkOrderDialog(true)}
              >
                Add Work Order
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInventoryDialog(true)}
                className="ml-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        isOpen={showSaveTemplateDialog}
        onClose={() => setShowSaveTemplateDialog(false)}
        invoice={invoice}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* Template Selector Dialog */}
      <InvoiceTemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        templates={templates}
        onSelect={handleApplyTemplate}
      />

      {/* Work Order Selector Dialog */}
      <WorkOrderSelector
        open={showWorkOrderDialog}
        onClose={() => setShowWorkOrderDialog(false)}
        workOrders={workOrders}
        onSelect={handleSelectWorkOrder}
      />

      {/* Inventory Item Selector Dialog */}
      <InventoryItemSelector
        open={showInventoryDialog}
        onClose={() => setShowInventoryDialog(false)}
        inventoryItems={inventoryItems}
        onSelect={handleAddInventoryItem}
      />
    </div>
  );
}
