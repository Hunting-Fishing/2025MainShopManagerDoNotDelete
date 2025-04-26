
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { WorkOrderDialog } from '../WorkOrderDialog';
import { InvoiceTemplateDialog } from '../templates/InvoiceTemplateDialog';
import { InvoiceItemForm } from '../InvoiceItemForm';
import { InvoiceItemsTable } from '../InvoiceItemsTable';
import { InvoiceDescriptionField } from '../InvoiceDescriptionField';
import { Invoice, InvoiceItem, InvoiceTemplate } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';
import { InventoryItem } from '@/types/inventory';

export interface InvoiceLeftColumnProps {
  invoice: Invoice;
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog?: boolean;
  showInventoryDialog?: boolean;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  setShowWorkOrderDialog?: (show: boolean) => void;
  setShowInventoryDialog?: (show: boolean) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InvoiceItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
  workOrders?: WorkOrder[];
}

export function InvoiceLeftColumn({
  invoice,
  inventoryItems,
  templates,
  showWorkOrderDialog = false,
  showInventoryDialog = false,
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
  workOrders = []
}: InvoiceLeftColumnProps) {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false);
  const [isDueDateCalendarOpen, setIsDueDateCalendarOpen] = useState(false);

  // Format date for display
  const formatDate = (isoString: string) => {
    try {
      return format(new Date(isoString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle date selection (invoice date)
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setInvoice(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
      setIsDateCalendarOpen(false);
    }
  };

  // Handle due date selection
  const handleDueDateSelect = (date: Date | undefined) => {
    if (date) {
      setInvoice(prev => ({
        ...prev,
        dueDate: date.toISOString().split('T')[0],
        due_date: date.toISOString().split('T')[0]
      }));
      setIsDueDateCalendarOpen(false);
    }
  };

  // Update item quantity
  const handleUpdateItem = (item: InvoiceItem) => {
    if (item.id && item.quantity) {
      handleUpdateItemQuantity(item.id, item.quantity);
    }
    if (item.id && item.description) {
      handleUpdateItemDescription(item.id, item.description);
    }
    if (item.id && item.price) {
      handleUpdateItemPrice(item.id, item.price);
    }
  };

  return (
    <div className="col-span-2 space-y-6">
      {/* Customer and Date Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <CardTitle className="text-lg">Invoice Details</CardTitle>
            <div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowWorkOrderDialog && setShowWorkOrderDialog(true)}
              >
                Select Work Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date</Label>
              <Popover open={isDateCalendarOpen} onOpenChange={setIsDateCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(invoice.date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DayPicker
                    mode="single"
                    selected={new Date(invoice.date)}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover open={isDueDateCalendarOpen} onOpenChange={setIsDueDateCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(invoice.dueDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DayPicker
                    mode="single"
                    selected={new Date(invoice.dueDate)}
                    onSelect={handleDueDateSelect}
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Customer Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer">Customer</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm">
                {invoice.customer}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <CardTitle className="text-lg">Items</CardTitle>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowInventoryDialog && setShowInventoryDialog(true)}
              >
                Add Inventory Item
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={handleAddLaborItem}
              >
                Add Labor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceItemsTable
            items={invoice.items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />

          <InvoiceItemForm 
            inventoryItems={inventoryItems} 
            onAddItem={handleAddInventoryItem} 
          />
          
          <div className="mt-6">
            <Label htmlFor="description">Description</Label>
            <InvoiceDescriptionField 
              value={invoice.description || ''} 
              onChange={(value) => 
                setInvoice(prev => ({ ...prev, description: value }))
              } 
            />
          </div>
        </CardContent>
      </Card>

      {/* Work Order Dialog */}
      {workOrders && (
        <WorkOrderDialog 
          open={showWorkOrderDialog}
          onOpenChange={setShowWorkOrderDialog || (() => {})}
          workOrders={workOrders}
          onSelectWorkOrder={handleSelectWorkOrder}
        />
      )}

      {/* Templates */}
      <div className="flex gap-2">
        <InvoiceTemplateDialog 
          templates={templates} 
          onSelectTemplate={handleApplyTemplate} 
        />
        <Button variant="outline">Save as Template</Button>
      </div>
    </div>
  );
}
