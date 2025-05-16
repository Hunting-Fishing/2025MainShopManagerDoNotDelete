
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkOrderSelector } from "@/components/invoices/WorkOrderSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";

// Import components as they would actually exist
import { WorkOrderSelectorDialog } from "@/components/invoices/dialogs/WorkOrderSelectorDialog";
import { InventoryItemSelector } from "@/components/invoices/dialogs/InventoryItemSelector";
import { InvoiceItemList } from "@/components/invoices/InvoiceItemList";
import { InvoiceTemplateSelector } from "@/components/invoices/templates/InvoiceTemplateSelector";
import { SaveTemplateDialog } from "@/components/invoices/SaveTemplateDialog";
import { inventoryToInvoiceItem } from "@/utils/typeAdapters";

export interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  showStaffDialog?: boolean;
  setShowStaffDialog?: (show: boolean) => void;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InvoiceItem) => void;
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
}: InvoiceLeftColumnProps) {
  // Helper function to handle inventory item selection and convert to invoice item
  const handleInventoryItemSelected = (inventoryItem: InventoryItem) => {
    const invoiceItem = inventoryToInvoiceItem(inventoryItem);
    handleAddInventoryItem(invoiceItem);
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                value={invoice.customer}
                onChange={(e) =>
                  setInvoice((prev) => ({ ...prev, customer: e.target.value }))
                }
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                value={invoice.customerEmail || invoice.customer_email || ""}
                onChange={(e) =>
                  setInvoice((prev) => ({ 
                    ...prev, 
                    customerEmail: e.target.value,
                    customer_email: e.target.value
                  }))
                }
                placeholder="Enter customer email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Customer Address</Label>
            <Textarea
              id="address"
              value={invoice.customerAddress || invoice.customer_address || ""}
              onChange={(e) =>
                setInvoice((prev) => ({ 
                  ...prev, 
                  customerAddress: e.target.value,
                  customer_address: e.target.value
                }))
              }
              placeholder="Enter customer address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Invoice Description</Label>
            <Textarea
              id="description"
              value={invoice.description || ""}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter invoice description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={invoice.notes || ""}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Enter additional notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <InvoiceTemplateSelector
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
            />
            <SaveTemplateDialog
              currentInvoice={invoice}
              taxRate={0.0875} // Default tax rate
              onSaveTemplate={handleSaveTemplate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Work Order Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Related Work Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {invoice.relatedWorkOrder || invoice.related_work_order
                ? `Work Order: #${invoice.relatedWorkOrder || invoice.related_work_order}`
                : "No work order linked"}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowWorkOrderDialog(true)}
            >
              Select Work Order
            </Button>
          </div>
          
          <WorkOrderSelectorDialog 
            workOrders={workOrders}
            open={showWorkOrderDialog}
            onSelect={handleSelectWorkOrder}
            onClose={() => setShowWorkOrderDialog(false)}
          />
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInventoryDialog(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Inventory
            </Button>
            <Button size="sm" variant="outline" onClick={handleAddLaborItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Labor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryItemSelector
            inventoryItems={inventoryItems}
            open={showInventoryDialog}
            onSelect={handleInventoryItemSelected}
            onClose={() => setShowInventoryDialog(false)}
          />
          
          <InvoiceItemList
            items={invoice.items || []}
            onRemove={handleRemoveItem}
            onQuantityChange={handleUpdateItemQuantity}
            onDescriptionChange={handleUpdateItemDescription}
            onPriceChange={handleUpdateItemPrice}
          />
          
          {(!invoice.items || invoice.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No items added to this invoice yet.
              <br />
              Add items using the buttons above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
