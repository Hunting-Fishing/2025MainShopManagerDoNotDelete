
import React from "react";
import { Invoice } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem, InvoiceTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Tag } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceTemplateActions } from "../InvoiceTemplateActions";
import { InvoiceDescriptionField } from "../InvoiceDescriptionField";
import { WorkOrderDialog } from "../WorkOrderDialog";
import { SaveTemplateDialog } from "../SaveTemplateDialog";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  setShowWorkOrderDialog: (show: boolean) => void;
  showInventoryDialog: boolean;
  setShowInventoryDialog: (show: boolean) => void;
  showTemplateDialog: boolean;
  setShowTemplateDialog: (show: boolean) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  onDescriptionChange: (description: string) => void;
  onSetWorkOrder: (workOrderId: string) => void;
  onSelectTemplate: (template: InvoiceTemplate) => void;
  onSaveTemplate: (template: any) => void;
}

export function InvoiceLeftColumn({
  invoice,
  workOrders,
  inventoryItems,
  templates,
  showWorkOrderDialog,
  setShowWorkOrderDialog,
  showInventoryDialog,
  setShowInventoryDialog,
  showTemplateDialog,
  setShowTemplateDialog,
  showSaveDialog,
  setShowSaveDialog,
  onDescriptionChange,
  onSetWorkOrder,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceLeftColumnProps) {
  // Dialogs
  const renderWorkOrderDialog = () => {
    if (!showWorkOrderDialog) return null;
    
    return (
      <WorkOrderDialog
        workOrders={workOrders}
        onSelect={onSetWorkOrder}
        onClose={() => setShowWorkOrderDialog(false)}
      />
    );
  };

  const renderSaveTemplateDialog = () => {
    if (!showSaveDialog) return null;
    
    return (
      <SaveTemplateDialog 
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        currentInvoice={invoice}
        taxRate={invoice.taxRate || 0}
        onSaveTemplate={onSaveTemplate}
      />
    );
  };

  // Content sections
  const renderWorkOrderSection = () => {
    const selectedWorkOrder = workOrders.find(wo => wo.id === invoice.work_order_id);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Work Order</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowWorkOrderDialog(true)}
          >
            <FileText className="h-4 w-4 mr-1" />
            {invoice.work_order_id ? "Change" : "Select"}
          </Button>
        </div>
        
        {invoice.work_order_id && selectedWorkOrder ? (
          <div className="rounded-md border p-3">
            <div className="font-medium">{selectedWorkOrder.id}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {selectedWorkOrder.description}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Created: {formatDate(selectedWorkOrder.createdAt)}</span>
              <span>Due: {selectedWorkOrder.dueDate ? formatDate(selectedWorkOrder.dueDate) : 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-3 text-center text-muted-foreground">
            <p className="text-sm">No work order selected</p>
          </div>
        )}
      </div>
    );
  };

  const renderInventorySection = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Inventory</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowInventoryDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Items
          </Button>
        </div>
        
        <div className="rounded-md border p-3 text-center text-muted-foreground">
          <div className="text-sm">
            {invoice.items.length === 0 
              ? "No inventory items added" 
              : `${invoice.items.length} items added to invoice`}
          </div>
          {invoice.items.length > 0 && (
            <div className="text-xs mt-1">
              Click "Add Items" to add more inventory items
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTags = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Tags</h3>
          <Button
            variant="ghost"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full flex gap-1 items-center">
            <span>Invoice</span>
          </div>
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex gap-1 items-center">
            <span>Repair</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 rounded-full"
          >
            <Tag className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderTemplateSection = () => {
    return (
      <div className="mb-6">
        <InvoiceTemplateActions
          invoice={invoice}
          onSelectTemplate={onSelectTemplate}
          onSaveTemplate={onSaveTemplate}
          taxRate={invoice.taxRate || 0}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderTemplateSection()}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InvoiceDescriptionField
            description={invoice.description || ''}
            onChange={onDescriptionChange}
          />
          
          {renderWorkOrderSection()}
          {renderInventorySection()}
          {renderTags()}
        </CardContent>
      </Card>
      
      {renderWorkOrderDialog()}
      {renderSaveTemplateDialog()}
    </div>
  );
}
