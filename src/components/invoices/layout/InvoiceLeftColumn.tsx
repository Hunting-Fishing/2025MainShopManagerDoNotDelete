
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, PlusCircle, FileText, ClipboardList } from "lucide-react";
import { useWorkOrderSelector } from "../WorkOrderSelector";
import { DatePicker } from "@/components/ui/date-picker";
import InvoiceItemList from "../InvoiceItemList";
import InvoiceTemplateSelector from "../InvoiceTemplateSelector";
import { SaveTemplateDialog } from "../SaveTemplateDialog";
import { Invoice, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";
import { InventoryItemSelector } from "../InventoryItemSelector";

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
}: InvoiceLeftColumnProps) {
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice((prev) => ({ ...prev, customer: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice((prev) => ({ ...prev, notes: e.target.value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setInvoice((prev) => ({ ...prev, date: date.toISOString().split('T')[0] }));
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      setInvoice((prev) => ({ ...prev, due_date: date.toISOString().split('T')[0] }));
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Invoice Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Customer & Date Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer" className="block text-sm font-medium mb-2">
                  Customer
                </label>
                <Input
                  id="customer"
                  placeholder="Customer name"
                  value={invoice.customer || ""}
                  onChange={handleCustomerChange}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-2">
                    Date
                  </label>
                  <DatePicker
                    date={invoice.date ? new Date(invoice.date) : undefined}
                    onDateChange={handleDateChange}
                  />
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <DatePicker
                    date={invoice.due_date ? new Date(invoice.due_date) : undefined}
                    onDateChange={handleDueDateChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Related Work Order */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Related Work Order</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkOrderDialog(true)}
                  className="h-8"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Select Work Order
                </Button>
              </div>
              {invoice.work_order_id && (
                <div className="p-3 bg-slate-50 rounded text-sm border">
                  {invoice.work_order_id}
                  {' - '}
                  {workOrders.find((wo) => wo.id === invoice.work_order_id)?.description || "Work Order"}
                </div>
              )}
              {!invoice.work_order_id && (
                <div className="p-3 bg-slate-50 rounded text-sm border border-dashed text-muted-foreground">
                  No work order associated with this invoice
                </div>
              )}
            </div>
            
            {/* Invoice Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Invoice description"
                rows={2}
                value={invoice.description || ""}
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Line Items</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddLaborItem}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Labor
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInventoryDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceItemList
            items={invoice.items || []}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateItemQuantity}
            onUpdatePrice={handleUpdateItemPrice}
            onUpdateDescription={handleUpdateItemDescription}
          />

          <Separator className="my-6" />

          <InvoiceTemplateSelector 
            templates={templates}
            onApplyTemplate={handleApplyTemplate}
            onSaveAsTemplate={() => setShowTemplateDialog(true)}
          />
        </CardContent>
      </Card>

      {/* Invoice Notes Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Additional notes visible to the customer..."
            rows={4}
            value={invoice.notes || ""}
            onChange={handleNotesChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showTemplateDialog && (
        <SaveTemplateDialog 
          invoice={invoice} 
          onSaveTemplate={handleSaveTemplate} 
          onClose={() => setShowTemplateDialog(false)} 
        />
      )}

      {/* This would be implemented with the proper dialog components */}
      {showInventoryDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4">Select Inventory Item</h3>
            <div className="max-h-96 overflow-y-auto">
              {inventoryItems.map((item) => (
                <div key={item.id} className="p-3 border-b hover:bg-slate-50">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      onClick={() => {
                        handleAddInventoryItem(item);
                        setShowInventoryDialog(false);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowInventoryDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
