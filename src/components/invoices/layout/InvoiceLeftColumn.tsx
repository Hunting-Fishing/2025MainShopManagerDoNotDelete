
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, Plus, Calendar } from "lucide-react";
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";
import { InvoiceItemsTable } from "../InvoiceItemsTable";
import { InventoryItemSelector } from "../InventoryItemSelector";
import { WorkOrderSelector } from "../WorkOrderSelector";
import { InvoiceTemplateActions } from "../InvoiceTemplateActions";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/formatters";

export interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  showStaffDialog: boolean;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  setShowStaffDialog: (show: boolean) => void;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InvoiceItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "created_at" | "usageCount">) => void;
}

export function InvoiceLeftColumn({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  showWorkOrderDialog,
  showInventoryDialog,
  showStaffDialog,
  setShowWorkOrderDialog,
  setShowInventoryDialog,
  setShowStaffDialog,
  setInvoice,
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
  const [items, setItems] = useState<InvoiceItem[]>(invoice.items || []);

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoice(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  // Handle due date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(prev => ({
      ...prev,
      due_date: e.target.value
    }));
  };

  // Function to adapt Inventory item to Invoice item
  const adaptInventoryItemToInvoiceItem = (item: InventoryItem): InvoiceItem => {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      description: item.description || '',
      quantity: 1,
      price: item.unit_price || 0,
      total: 1 * (item.unit_price || 0),
      sku: item.sku,
      invoice_id: invoice.id
    };
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Related Work Order and Templates */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
            <div className="w-full sm:w-1/2">
              <Label>Related Work Order</Label>
              <div className="flex mt-1.5">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowWorkOrderDialog(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {invoice.relatedWorkOrder ? invoice.relatedWorkOrder.id : (invoice.related_work_order ? invoice.related_work_order.id : 'Select Work Order')}
                </Button>
              </div>
            </div>
            <div className="w-full sm:w-1/2">
              <Label>Templates</Label>
              <div className="flex mt-1.5 gap-2">
                <InvoiceTemplateActions 
                  invoice={invoice}
                  taxRate={0.0725}
                  onSelectTemplate={handleApplyTemplate}
                  onSaveTemplate={handleSaveTemplate}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief invoice description"
              className="mt-1.5"
              value={invoice.description || ''}
              onChange={handleDescriptionChange}
            />
          </div>

          {/* Due date */}
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex items-center mt-1.5">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dueDate"
                type="date"
                value={invoice.due_date}
                onChange={handleDueDateChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Items</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInventoryDialog(true)}
            >
              <Package className="mr-2 h-4 w-4" />
              Add Part
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddLaborItem}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Labor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceItemsTable
            items={invoice.items || []}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateItemQuantity}
            onUpdateDescription={handleUpdateItemDescription}
            onUpdatePrice={handleUpdateItemPrice}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Additional notes for the invoice"
            value={invoice.notes || ''}
            onChange={handleNotesChange}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Work Order Selection Dialog */}
      <WorkOrderSelector
        workOrders={workOrders}
        open={showWorkOrderDialog}
        onSelect={handleSelectWorkOrder}
        onClose={() => setShowWorkOrderDialog(false)}
      />

      {/* Inventory Item Selection Dialog */}
      <InventoryItemSelector
        inventoryItems={inventoryItems}
        open={showInventoryDialog}
        onSelect={(item) => handleAddInventoryItem(adaptInventoryItemToInvoiceItem(item))}
        onClose={() => setShowInventoryDialog(false)}
        templates={templates}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}
