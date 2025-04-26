
import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ClipboardList, Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkOrderDialog } from '../WorkOrderDialog';
import { InventoryDialog } from '../InventoryDialog';
import { InvoiceItemsTable } from "../InvoiceItemsTable";
import { InvoiceItemForm } from "../InvoiceItemForm";
import { InvoiceDescriptionField } from '../InvoiceDescriptionField';
import { InvoiceTemplateActions } from '../../invoice/InvoiceTemplateActions';
import { Invoice, InvoiceItem, InvoiceTemplate } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';
import { InventoryItem } from '@/types/inventory';

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  showWorkOrderDialog: boolean; 
  setShowWorkOrderDialog: (show: boolean) => void;
  showInventoryDialog: boolean;
  setShowInventoryDialog: (show: boolean) => void;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InventoryItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usage_count" | "last_used">) => void;
}

export function InvoiceLeftColumn({
  invoice,
  setInvoice,
  showWorkOrderDialog,
  setShowWorkOrderDialog,
  showInventoryDialog,
  setShowInventoryDialog,
  workOrders,
  inventoryItems,
  templates,
  handleSelectWorkOrder,
  handleAddInventoryItem,
  handleRemoveItem,
  handleUpdateItemQuantity,
  handleUpdateItemDescription,
  handleUpdateItemPrice,
  handleAddLaborItem,
  handleApplyTemplate,
  handleSaveTemplate
}: InvoiceLeftColumnProps) {
  // State for date pickers
  const [isInvoiceDateOpen, setIsInvoiceDateOpen] = useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  
  // Helper function for date format
  const formatDate = (date: string) => {
    return format(new Date(date), "PPP");
  };
  
  // Update invoice date
  const handleInvoiceDateSelect = (date: Date) => {
    setInvoice((prev) => ({
      ...prev,
      date: date.toISOString()
    }));
    setIsInvoiceDateOpen(false);
  };
  
  // Update due date
  const handleDueDateSelect = (date: Date) => {
    setInvoice((prev) => ({
      ...prev,
      dueDate: date.toISOString()
    }));
    setIsDueDateOpen(false);
  };
  
  // Disable past dates for invoice date picker
  const disablePastDates = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  // Function to handle description updates
  const handleDescriptionChange = (description: string) => {
    setInvoice((prev) => ({
      ...prev,
      description
    }));
  };

  // Calculate the minimum due date (invoice date)
  const minDueDate = new Date(invoice.date);
  
  // Create a handler for updating invoice items
  const handleUpdateItem = (item: InvoiceItem) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(existingItem => 
        existingItem.id === item.id ? item : existingItem
      )
    }));
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Work Order and Dates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Work Order Selection */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Work Order</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 border rounded text-sm">
                {invoice.workOrderId || "No work order attached"}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setShowWorkOrderDialog(true)}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Select Work Order
              </Button>
            </div>
            
            <WorkOrderDialog 
              open={showWorkOrderDialog} 
              onClose={() => setShowWorkOrderDialog(false)} 
              workOrders={workOrders} 
              onSelectWorkOrder={handleSelectWorkOrder} 
            />
          </div>

          {/* Invoice Date & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Invoice Date</label>
              <Popover open={isInvoiceDateOpen} onOpenChange={setIsInvoiceDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(invoice.date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(invoice.date)}
                    onSelect={handleInvoiceDateSelect}
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Due Date</label>
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(invoice.dueDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(invoice.dueDate)}
                    onSelect={handleDueDateSelect}
                    disabled={(date) => date < minDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Description Field */}
          <InvoiceDescriptionField
            description={invoice.description || ""}
            onChange={handleDescriptionChange}
          />
        </CardContent>
      </Card>

      {/* Invoice Items Section */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-semibold">Invoice Items</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInventoryDialog(true)}
              >
                <Package className="mr-1 h-4 w-4" />
                Inventory Items
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLaborItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                Labor Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <InvoiceItemsTable
            items={invoice.items}
            onRemoveItem={handleRemoveItem}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onUpdateItemDescription={handleUpdateItemDescription}
            onUpdateItemPrice={handleUpdateItemPrice}
          />
          
          <InvoiceItemForm 
            onAddItem={(item) => setInvoice(prev => ({
              ...prev,
              items: [...prev.items, item]
            }))} 
          />

          <InventoryDialog 
            open={showInventoryDialog} 
            onClose={() => setShowInventoryDialog(false)} 
            inventoryItems={inventoryItems} 
            onSelectItems={handleAddInventoryItem} 
          />
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-semibold">Templates</CardTitle>
            <InvoiceTemplateActions 
              invoice={invoice}
              taxRate={taxRate}
              onSelectTemplate={handleApplyTemplate}
              onSaveTemplate={handleSaveTemplate}
            />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
