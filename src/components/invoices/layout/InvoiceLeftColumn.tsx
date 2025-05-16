import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WorkOrder } from "@/types/workOrder";
import { Invoice, InvoiceTemplate } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { InventoryItemSelector } from "./InventoryItemSelector";
import { WorkOrderSelector } from "./WorkOrderSelector";
import { TemplateSelector } from "./TemplateSelector";

// Define the props interface for the InvoiceLeftColumn component
export interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  setShowWorkOrderDialog: (show: boolean) => void;
  showStaffDialog?: boolean; // Made optional for backward compatibility
  onWorkOrderSelect: (workOrderId: string) => void;
  onCustomerChange: (customerId: string) => void;
  onAddressChange: (address: string) => void;
  onEmailChange: (email: string) => void;
  onCustomerNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onRemoveInventoryItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, quantity: number) => void;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => Promise<void>;
  onGenerateFromWorkOrder: (workOrderId: string) => void;
}

// InvoiceLeftColumn component
export const InvoiceLeftColumn: React.FC<InvoiceLeftColumnProps> = ({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  showWorkOrderDialog,
  setShowWorkOrderDialog,
  onWorkOrderSelect,
  onCustomerChange,
  onAddressChange,
  onEmailChange,
  onCustomerNameChange,
  onNotesChange,
  onAddInventoryItem,
  onRemoveInventoryItem,
  onUpdateItemQuantity,
  onSaveTemplate,
  onGenerateFromWorkOrder,
}) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    invoice.date ? new Date(invoice.date) : undefined
  );
  const [selectedDueDate, setSelectedDueDate] = React.useState<
    Date | undefined
  >(invoice.due_date ? new Date(invoice.due_date) : undefined);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setSelectedDueDate(date);
  };

  return (
    <div className="w-1/2 p-4">
      <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>

      {/* Customer Section */}
      <div className="mb-4">
        <Label htmlFor="customer">Customer</Label>
        <Input
          type="text"
          id="customer"
          value={invoice.customer}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="mb-2"
        />
        <Label htmlFor="customer_address">Address</Label>
        <Textarea
          id="customer_address"
          value={invoice.customer_address || ""}
          onChange={(e) => onAddressChange(e.target.value)}
          className="mb-2"
        />
        <Label htmlFor="customer_email">Email</Label>
        <Input
          type="email"
          id="customer_email"
          value={invoice.customer_email || ""}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      {/* Date Section */}
      <div className="mb-4">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Due Date Section */}
      <div className="mb-4">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDueDate && "text-muted-foreground"
              )}
            >
              {selectedDueDate ? (
                format(selectedDueDate, "PPP")
              ) : (
                <span>Pick a due date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDueDate}
              onSelect={handleDueDateChange}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Notes Section */}
      <div className="mb-4">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={invoice.notes || ""}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      {/* Inventory Items Section */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Inventory Items</h3>
        <Button onClick={() => setShowInventoryDialog(true)}>
          Add Inventory Item
        </Button>
        {/* Display added inventory items here */}
      </div>

      {/* Work Order Section */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Work Order</h3>
        <Button onClick={() => setShowWorkOrderDialog(true)}>
          Select Work Order
        </Button>
        {/* Display selected work order here */}
      </div>

      {/* Template Section */}
      <div>
        <h3 className="text-md font-semibold mb-2">Template</h3>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dialogs */}
      <InventoryItemSelector
        open={showInventoryDialog}
        onClose={() => setShowInventoryDialog(false)}
        onSelect={(item) => {
          onAddInventoryItem(item);
          setShowInventoryDialog(false);
        }}
        inventoryItems={inventoryItems}
        templates={templates}
        onApplyTemplate={(template) => {
          console.log("Applying template:", template);
        }}
      />

      <WorkOrderSelector
        open={showWorkOrderDialog}
        onClose={() => setShowWorkOrderDialog(false)}
        workOrders={workOrders}
        onSelect={(workOrderId) => {
          onWorkOrderSelect(workOrderId);
          setShowWorkOrderDialog(false);
        }}
      />
    </div>
  );
};
