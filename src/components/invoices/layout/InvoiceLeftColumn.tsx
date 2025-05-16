
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package2, Briefcase, Save } from 'lucide-react';
import { InvoiceItem, InvoiceTemplate, StaffMember } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';
import { InventoryItem } from '@/types/inventory';

export interface InvoiceLeftColumnProps {
  invoice: any;
  workOrders: WorkOrder[];
  inventoryItems: InventoryItem[];
  templates: InvoiceTemplate[];
  showWorkOrderDialog: boolean;
  showInventoryDialog: boolean;
  showStaffDialog: boolean;
  setShowWorkOrderDialog: (show: boolean) => void;
  setShowInventoryDialog: (show: boolean) => void;
  setShowStaffDialog: (show: boolean) => void;
  setInvoice: (invoice: any) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
  handleAddInventoryItem: (item: InvoiceItem) => void;
  handleRemoveItem: (id: string) => void;
  handleUpdateItemQuantity: (id: string, quantity: number) => void;
  handleUpdateItemDescription: (id: string, description: string) => void;
  handleUpdateItemPrice: (id: string, price: number) => void;
  handleAddLaborItem: () => void;
  handleApplyTemplate: (template: InvoiceTemplate) => void;
  handleSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => Promise<void>;
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
  handleSaveTemplate
}: InvoiceLeftColumnProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const handleWorkOrderSelect = (workOrder: WorkOrder) => {
    handleSelectWorkOrder(workOrder);
  };

  const saveAsTemplate = async () => {
    try {
      await handleSaveTemplate({
        name: templateName,
        description: templateDescription,
        default_items: invoice.items || [],
        default_tax_rate: invoice.taxRate || 0,
        default_notes: invoice.notes || '',
        default_due_date_days: 30
      });
      setShowTemplateDialog(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Error saving template', error);
    }
  };
  
  return (
    <div className="col-span-2 space-y-6">
      {/* Work Order Reference Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Work Order Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowWorkOrderDialog(true)}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {invoice.work_order_id ? "Change Work Order" : "Link to Work Order"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Items</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowInventoryDialog(true)}>
              <Package2 className="mr-2 h-4 w-4" />
              Add Inventory
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddLaborItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Labor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Item list would go here */}
          {invoice.items && invoice.items.length > 0 ? (
            <div className="space-y-4">
              {invoice.items.map((item: InvoiceItem) => (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">{item.description}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Qty: {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No items added yet. Add inventory items or labor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Templates</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save as Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates.length > 0 ? (
              <div className="space-y-2">
                {templates.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No templates available. Save this invoice as a template for future use.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog components would be rendered here */}
    </div>
  );
}
