
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Receipt, LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkOrderLinkSection } from "@/components/invoices/WorkOrderLinkSection";
import { InvoiceItemsTable } from "@/components/invoices/InvoiceItemsTable";
import { InvoiceTemplateSelector } from "@/components/invoices/templates/InvoiceTemplateSelector";
import { SaveTemplateDialog } from "@/components/invoices/templates/SaveTemplateDialog";
import { Invoice, InvoiceItem, WorkOrder, InvoiceTemplate, createInvoiceUpdater } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  setInvoice: (updater: any) => void;
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
  handleSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
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
  // Handle clearing the work order reference
  const handleClearWorkOrder = () => {
    setInvoice(createInvoiceUpdater({ 
      workOrderId: undefined,
      description: ""
    }));
  };

  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setInvoice(createInvoiceUpdater({ 
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Handle due date selection
  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      setInvoice(createInvoiceUpdater({ 
        dueDate: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Receipt className="h-5 w-5 mr-2" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Work Order Link Section */}
          <WorkOrderLinkSection
            workOrderId={invoice.workOrderId || ""}
            description={invoice.description || ""}
            workOrders={workOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
            onClearWorkOrder={handleClearWorkOrder}
            showWorkOrderDialog={showWorkOrderDialog}
            setShowWorkOrderDialog={setShowWorkOrderDialog}
          />

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer Name*</Label>
              <Input 
                id="customer" 
                value={invoice.customer} 
                onChange={(e) => setInvoice(createInvoiceUpdater({ customer: e.target.value }))}
                placeholder="Enter customer name" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input 
                  id="customerEmail" 
                  type="email" 
                  value={invoice.customerEmail || ""} 
                  onChange={(e) => setInvoice(createInvoiceUpdater({ customerEmail: e.target.value }))}
                  placeholder="Enter customer email" 
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input 
                  id="customerPhone" 
                  type="tel" 
                  placeholder="Enter customer phone" 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customerAddress">Customer Address</Label>
              <Textarea 
                id="customerAddress" 
                value={invoice.customerAddress || ""} 
                onChange={(e) => setInvoice(createInvoiceUpdater({ customerAddress: e.target.value }))}
                placeholder="Enter customer address" 
              />
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoice.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoice.date ? format(new Date(invoice.date), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoice.date ? new Date(invoice.date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoice.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoice.dueDate ? format(new Date(invoice.dueDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoice.dueDate ? new Date(invoice.dueDate) : undefined}
                    onSelect={handleDueDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Invoice Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={invoice.description || ""} 
              onChange={(e) => setInvoice(createInvoiceUpdater({ description: e.target.value }))}
              placeholder="Enter invoice description" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Invoice Items</CardTitle>
          <div className="flex space-x-2">
            <InvoiceTemplateSelector 
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
            />
            <SaveTemplateDialog 
              invoice={invoice}
              onSaveTemplate={handleSaveTemplate}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="items">
            <TabsList className="mb-4">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="labor">Labor</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="space-y-4">
              <InvoiceItemsTable 
                items={invoice.items}
                onRemoveItem={handleRemoveItem}
                onUpdateItemQuantity={handleUpdateItemQuantity}
                onUpdateItemDescription={handleUpdateItemDescription}
                onUpdateItemPrice={handleUpdateItemPrice}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInventoryDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inventory Item
                </Button>
              </div>
              
              <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Select Inventory Item</DialogTitle>
                    <DialogDescription>
                      Choose an inventory item to add to the invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                      {inventoryItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            handleAddInventoryItem(item);
                            setShowInventoryDialog(false);
                          }}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-slate-500">{item.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${item.price.toFixed(2)}</div>
                            <div className="text-sm text-slate-500">{item.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
            <TabsContent value="labor" className="space-y-4">
              <InvoiceItemsTable 
                items={invoice.items.filter(item => item.hours)}
                onRemoveItem={handleRemoveItem}
                onUpdateItemQuantity={handleUpdateItemQuantity}
                onUpdateItemDescription={handleUpdateItemDescription}
                onUpdateItemPrice={handleUpdateItemPrice}
              />
              
              <Button 
                variant="outline" 
                onClick={handleAddLaborItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Labor Item
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter any additional notes or payment terms" 
            className="min-h-[100px]"
            value={invoice.notes || ""}
            onChange={(e) => setInvoice(createInvoiceUpdater({ notes: e.target.value }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
