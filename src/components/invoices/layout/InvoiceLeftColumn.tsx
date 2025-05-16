
// Fix the SaveTemplateDialog missing taxRate prop
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Clock,
  Users, 
  FileCheck
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker"; 
import { useWorkOrderSelector } from "../WorkOrderSelector";
import { Invoice, StaffMember, InvoiceTemplate, InvoiceItem } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { InventoryItemSelector } from "@/components/invoices/InventoryItemSelector";
import { InvoiceItemList } from "../InvoiceItemList";
import { InvoiceTemplateSelector } from "../InvoiceTemplateSelector";
import { StaffSelector } from "../StaffSelector";
import { SaveTemplateDialog } from "../SaveTemplateDialog";
import { WorkOrder } from "@/types/workOrder";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  items?: InvoiceItem[];
  assignedStaff?: StaffMember[];
  showWorkOrderDialog?: boolean;
  showInventoryDialog?: boolean;
  showStaffDialog?: boolean;
  workOrders?: WorkOrder[];
  inventoryItems?: InventoryItem[];
  staffMembers?: StaffMember[];
  templates?: InvoiceTemplate[];
  taxRate: number;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  setShowWorkOrderDialog?: (show: boolean) => void;
  setShowInventoryDialog?: (show: boolean) => void;
  setShowStaffDialog?: (show: boolean) => void;
  handleSelectWorkOrder?: (workOrder: WorkOrder) => void;
  handleAddInventoryItem?: (item: InvoiceItem) => void;
  handleAddStaffMember?: (member: StaffMember) => void;
  handleRemoveStaffMember?: (id: string) => void;
  handleRemoveItem?: (id: string) => void;
  handleUpdateItemQuantity?: (id: string, quantity: number) => void;
  handleUpdateItemDescription?: (id: string, description: string) => void;
  handleUpdateItemPrice?: (id: string, price: number) => void;
  handleAddLaborItem?: () => void;
  handleSaveTemplate?: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  handleApplyTemplate?: (template: InvoiceTemplate) => void;
}

export function InvoiceLeftColumn({
  invoice,
  items = [],
  assignedStaff = [],
  showWorkOrderDialog = false,
  showInventoryDialog = false,
  showStaffDialog = false,
  workOrders = [],
  inventoryItems = [],
  staffMembers = [],
  templates = [],
  taxRate,
  setInvoice,
  setShowWorkOrderDialog = () => {},
  setShowInventoryDialog = () => {},
  setShowStaffDialog = () => {},
  handleSelectWorkOrder = () => {},
  handleAddInventoryItem = () => {},
  handleAddStaffMember = () => {},
  handleRemoveStaffMember = () => {},
  handleRemoveItem = () => {},
  handleUpdateItemQuantity = () => {},
  handleUpdateItemDescription = () => {},
  handleUpdateItemPrice = () => {},
  handleAddLaborItem = () => {},
  handleSaveTemplate = () => {},
  handleApplyTemplate = () => {},
}: InvoiceLeftColumnProps) {
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(prev => ({
      ...prev,
      customer: e.target.value
    }));
  };
  
  const handleCustomerEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(prev => ({
      ...prev,
      customer_email: e.target.value
    }));
  };
  
  const handleCustomerAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      customer_address: e.target.value
    }));
  };
  
  const handleInvoiceDateChange = (date: Date) => {
    if (!date) return;
    setInvoice(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };
  
  const handleDueDateChange = (date: Date) => {
    if (!date) return;
    setInvoice(prev => ({
      ...prev,
      due_date: date.toISOString().split('T')[0]
    }));
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      description: e.target.value
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const handleCloseTemplateDialog = () => {
    // Just a placeholder function to close the template dialog
  };

  // For DatePicker, convert string dates to Date objects
  const invoiceDate = invoice.date ? new Date(invoice.date) : new Date();
  const dueDate = invoice.due_date ? new Date(invoice.due_date) : new Date();

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <Input
              value={invoice.customer}
              onChange={handleCustomerChange}
              placeholder="Enter customer name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={invoice.customer_email}
              onChange={handleCustomerEmailChange}
              placeholder="customer@example.com"
              type="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              value={invoice.customer_address}
              onChange={handleCustomerAddressChange}
              placeholder="Enter customer address"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowWorkOrderDialog(true)}
            >
              <FileText className="h-4 w-4" />
              Link Work Order
            </Button>
            
            <InvoiceTemplateSelector
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
            />
            
            <SaveTemplateDialog
              invoice={invoice}
              taxRate={taxRate}
              onSaveTemplate={handleSaveTemplate}
              onClose={handleCloseTemplateDialog}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Dates */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Date</label>
            <DatePicker
              date={invoiceDate}
              onSelect={handleInvoiceDateChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <DatePicker
              date={dueDate}
              onSelect={handleDueDateChange}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Items */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Line Items</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddLaborItem}
                className="flex items-center gap-1"
              >
                <Clock className="h-4 w-4" />
                Add Labor
              </Button>
              
              <InventoryItemSelector 
                inventoryItems={inventoryItems}
                onAddInventoryItem={handleAddInventoryItem}
                showInventoryDialog={showInventoryDialog}
                setShowInventoryDialog={setShowInventoryDialog}
              />
            </div>
          </div>
          
          <InvoiceItemList 
            items={items}
            onRemove={handleRemoveItem}
            onQuantityChange={handleUpdateItemQuantity}
            onDescriptionChange={handleUpdateItemDescription}
            onPriceChange={handleUpdateItemPrice}
          />
        </CardContent>
      </Card>
      
      {/* Staff */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Staff</h3>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowStaffDialog(true)}
            >
              <Users className="h-4 w-4" />
              Add Staff
            </Button>
          </div>
          
          <div className="space-y-2">
            {assignedStaff.length > 0 ? (
              assignedStaff.map(staff => (
                <div key={staff.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{staff.name} {staff.role ? `(${staff.role})` : ''}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveStaffMember(staff.id)}
                    className="h-8 w-8 p-0"
                  >
                    &times;
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No staff assigned</p>
            )}
          </div>
          
          {showStaffDialog && (
            <StaffSelector
              staffMembers={staffMembers}
              onSelect={handleAddStaffMember}
              onClose={() => setShowStaffDialog(false)}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Description & Notes */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={invoice.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Enter invoice description"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={invoice.notes || ''}
              onChange={handleNotesChange}
              placeholder="Enter notes or payment instructions"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
