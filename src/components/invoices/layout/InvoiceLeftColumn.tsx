import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";
import { Invoice } from "@/types/invoice";
import { InvoiceItemForm } from "../InvoiceItemForm";
import { InvoiceTemplateActions } from "../InvoiceTemplateActions";
import { InvoiceItem } from "@/types/invoice";
import { InvoiceItemsTable } from "../InvoiceItemsTable";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: any[];
  taxRate: number;
  setInvoice: (invoice: Invoice) => void;
  onAddItem: (item: InvoiceItem) => void;
  onUpdateItem: (item: InvoiceItem) => void;
  onRemoveItem: (id: string) => void;
  onSelectTemplate: (template: any) => void;
  onSaveTemplate: (template: any) => void;
}

export function InvoiceLeftColumn({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  taxRate,
  setInvoice,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceLeftColumnProps) {
  // Function to handle date changes
  const handleDateChange = (date: Date | undefined, field: 'date' | 'dueDate') => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setInvoice({
        ...invoice,
        [field]: formattedDate,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-id">Invoice ID</Label>
              <Input id="invoice-id" value={invoice.id} readOnly />
            </div>
            <div>
              <Label htmlFor="customer-id">Customer ID</Label>
              <Input id="customer-id" value={invoice.customer_id || invoice.customer} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !invoice.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoice.date ? format(new Date(invoice.date), "PPP") : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    date={invoice.date ? new Date(invoice.date) : undefined}
                    onSelect={(date) => handleDateChange(date, 'date')}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !invoice.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoice.dueDate ? format(new Date(invoice.dueDate), "PPP") : (
                      <span>Pick a due date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    date={invoice.dueDate ? new Date(invoice.dueDate) : undefined}
                    onSelect={(date) => handleDateChange(date, 'dueDate')}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Invoice notes..."
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceItemsTable
            items={invoice.items}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
          <InvoiceItemForm
            inventoryItems={inventoryItems}
            onAddItem={onAddItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTemplateActions
            invoice={invoice}
            taxRate={taxRate}
            templates={templates}
            onSelectTemplate={onSelectTemplate}
            onSaveTemplate={onSaveTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
