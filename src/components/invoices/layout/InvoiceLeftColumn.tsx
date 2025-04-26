
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { WorkOrderDialog } from '../WorkOrderDialog';
import { InvoiceItemsTable } from '../InvoiceItemsTable';
import { InvoiceItemForm } from '../InvoiceItemForm';
import { InvoiceTemplateDialog } from '../InvoiceTemplateDialog';
import { InvoiceTemplateActions } from '../../invoice/InvoiceTemplateActions';
import { InvoiceDescriptionField } from '../InvoiceDescriptionField';
import { Invoice, InvoiceItem, InvoiceTemplate } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';
import { InventoryItem } from '@/types/inventory';

export interface InvoiceLeftColumnProps {
  invoice: Invoice;
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  onAddLaborItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemQuantity?: (id: string, quantity: number) => void;
  onUpdateItemDescription?: (id: string, description: string) => void;
  onUpdateItemPrice?: (id: string, price: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
  // Optional props
  workOrders?: WorkOrder[];
  showWorkOrderDialog?: boolean;
  showInventoryDialog?: boolean;
  setShowWorkOrderDialog?: (show: boolean) => void;
  handleSelectWorkOrder?: (workOrder: WorkOrder) => void;
}

export function InvoiceLeftColumn({
  invoice,
  inventoryItems,
  templates,
  onAddLaborItem,
  onRemoveItem,
  onUpdateItemQuantity,
  onUpdateItemDescription,
  onUpdateItemPrice,
  onAddInventoryItem,
  setInvoice,
  handleApplyTemplate,
  handleSaveTemplate,
  // Optional with defaults
  workOrders = [],
  showWorkOrderDialog = false,
  showInventoryDialog = false,
  setShowWorkOrderDialog = () => {},
  handleSelectWorkOrder = () => {},
}: InvoiceLeftColumnProps) {
  // State for handling date field popups
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);

  // Handle date changes
  const handleDateChange = (field: 'date' | 'dueDate', date: Date | undefined) => {
    if (!date) return;
    
    setInvoice(prev => ({
      ...prev,
      [field]: format(date, 'yyyy-MM-dd')
    }));
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (description: string) => {
    setInvoice(prev => ({
      ...prev,
      description
    }));
  };

  const handleAddItem = (item: InvoiceItem) => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  // Helper to disable past dates
  const disablePastDates = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Work Order Selection */}
            {workOrders && workOrders.length > 0 && (
              <div className="md:col-span-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWorkOrderDialog && setShowWorkOrderDialog(true)} 
                  className="w-full justify-start text-slate-600"
                >
                  {invoice.workOrderId ? 
                    `Work Order: ${invoice.workOrderId}` : 
                    "Select Work Order"
                  }
                </Button>
              </div>
            )}

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                name="customer"
                value={invoice.customer}
                onChange={handleCustomerInfoChange}
                placeholder="Enter customer name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                value={invoice.customerEmail}
                onChange={handleCustomerInfoChange}
                placeholder="Enter email address"
                type="email"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                name="customerAddress"
                value={invoice.customerAddress}
                onChange={handleCustomerInfoChange}
                placeholder="Enter customer address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Invoice Details</span>
            <InvoiceTemplateActions 
              invoice={invoice}
              taxRate={0.08} // This should be passed from parent
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
              onSaveTemplate={handleSaveTemplate}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Date */}
            <div className="space-y-2">
              <Label>Invoice Date</Label>
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
                    {invoice.date ? format(new Date(invoice.date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoice.date ? new Date(invoice.date) : undefined}
                    onSelect={(date) => handleDateChange('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
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
                    {invoice.dueDate ? format(new Date(invoice.dueDate), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoice.dueDate ? new Date(invoice.dueDate) : undefined}
                    onSelect={(date) => handleDateChange('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={invoice.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Enter invoice description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Invoice Items</span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={onAddLaborItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Labor
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceItemsTable 
            items={invoice.items} 
            onRemoveItem={onRemoveItem} 
            onUpdateItem={(item) => {
              const updatedItems = invoice.items.map(i => i.id === item.id ? item : i);
              setInvoice(prev => ({...prev, items: updatedItems}));
            }}
          />

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Add New Item</h4>
            <InvoiceItemForm onAddItem={handleAddItem} />
          </div>
        </CardContent>
      </Card>

      {/* Work Order Dialog */}
      {workOrders && workOrders.length > 0 && (
        <WorkOrderDialog
          open={showWorkOrderDialog}
          onClose={() => setShowWorkOrderDialog(false)}
          workOrders={workOrders}
          onSelectWorkOrder={handleSelectWorkOrder}
        />
      )}
    </div>
  );
}
