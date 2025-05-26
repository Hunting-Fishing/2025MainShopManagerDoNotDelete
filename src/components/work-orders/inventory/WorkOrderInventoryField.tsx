
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import { WorkOrderInventoryField as InventoryFieldType, WorkOrderInventoryItem } from "@/types/workOrder";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { SpecialOrderItemForm } from "./SpecialOrderItemForm";
import { SelectedInventoryTable } from "./SelectedInventoryTable";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderInventoryFieldProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({ form }) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showSpecialOrderForm, setShowSpecialOrderForm] = useState(false);

  // Get current inventory items from form
  const inventoryItems = form.watch("inventoryItems") || [];

  const handleAddInventoryItem = (selectedItems: any[]) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Convert selected items to WorkOrderInventoryItem format
    const workOrderItems: WorkOrderInventoryItem[] = selectedItems.map((item, index) => {
      const baseItem: WorkOrderInventoryItem = {
        id: item.id || `temp-${Date.now()}-${index}`,
        name: item.name || 'Unknown Item',
        sku: item.sku || 'NO-SKU',
        category: item.category || 'General',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price || 0,
        total: (item.quantity || 1) * (item.unit_price || item.price || 0)
      };

      // Add optional properties only if they exist and are not undefined
      if (item.notes !== undefined) {
        baseItem.notes = item.notes;
      }
      if (item.itemStatus !== undefined) {
        baseItem.itemStatus = item.itemStatus;
      }
      if (item.estimatedArrivalDate !== undefined) {
        baseItem.estimatedArrivalDate = item.estimatedArrivalDate;
      }
      if (item.supplierName !== undefined) {
        baseItem.supplierName = item.supplierName;
      }
      if (item.supplierOrderRef !== undefined) {
        baseItem.supplierOrderRef = item.supplierOrderRef;
      }

      return baseItem;
    });

    // Convert existing items to ensure they have all required properties
    const normalizedCurrentItems: WorkOrderInventoryItem[] = currentItems.map((existingItem, index) => {
      const normalizedItem: WorkOrderInventoryItem = {
        id: existingItem.id || `temp-${Date.now()}-${index}`,
        name: existingItem.name || 'Unknown Item',
        sku: existingItem.sku || 'NO-SKU',
        category: existingItem.category || 'General',
        quantity: existingItem.quantity || 1,
        unit_price: existingItem.unit_price || 0,
        total: existingItem.total || ((existingItem.quantity || 1) * (existingItem.unit_price || 0))
      };
      
      // Add optional properties only if they exist
      if (existingItem.notes !== undefined) {
        normalizedItem.notes = existingItem.notes;
      }
      if (existingItem.itemStatus !== undefined) {
        normalizedItem.itemStatus = existingItem.itemStatus;
      }
      if (existingItem.estimatedArrivalDate !== undefined) {
        normalizedItem.estimatedArrivalDate = existingItem.estimatedArrivalDate;
      }
      if (existingItem.supplierName !== undefined) {
        normalizedItem.supplierName = existingItem.supplierName;
      }
      if (existingItem.supplierOrderRef !== undefined) {
        normalizedItem.supplierOrderRef = existingItem.supplierOrderRef;
      }
      
      return normalizedItem;
    });

    const updatedItems: WorkOrderInventoryItem[] = [...normalizedCurrentItems, ...workOrderItems];
    form.setValue("inventoryItems", updatedItems, { shouldValidate: true });
    setShowInventoryDialog(false);
  };

  const handleAddSpecialOrder = (specialOrderData: any) => {
    const newItem: WorkOrderInventoryItem = {
      id: `special-${Date.now()}`,
      name: specialOrderData.name || 'Special Order Item',
      sku: specialOrderData.sku || 'SPECIAL-ORDER',
      category: specialOrderData.category || 'Special Order',
      quantity: specialOrderData.quantity || 1,
      unit_price: specialOrderData.unit_price || 0,
      total: (specialOrderData.quantity || 1) * (specialOrderData.unit_price || 0)
    };

    // Add optional properties only if they exist
    if (specialOrderData.notes !== undefined) {
      newItem.notes = specialOrderData.notes;
    }
    if (specialOrderData.itemStatus !== undefined) {
      newItem.itemStatus = specialOrderData.itemStatus;
    }
    if (specialOrderData.estimatedArrivalDate !== undefined) {
      newItem.estimatedArrivalDate = specialOrderData.estimatedArrivalDate;
    }
    if (specialOrderData.supplierName !== undefined) {
      newItem.supplierName = specialOrderData.supplierName;
    }
    if (specialOrderData.supplierOrderRef !== undefined) {
      newItem.supplierOrderRef = specialOrderData.supplierOrderRef;
    }
    
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Convert existing items to ensure they have all required properties
    const normalizedCurrentItems: WorkOrderInventoryItem[] = currentItems.map((existingItem, index) => {
      const normalizedItem: WorkOrderInventoryItem = {
        id: existingItem.id || `temp-${Date.now()}-${index}`,
        name: existingItem.name || 'Unknown Item',
        sku: existingItem.sku || 'NO-SKU',
        category: existingItem.category || 'General',
        quantity: existingItem.quantity || 1,
        unit_price: existingItem.unit_price || 0,
        total: existingItem.total || ((existingItem.quantity || 1) * (existingItem.unit_price || 0))
      };
      
      // Add optional properties only if they exist
      if (existingItem.notes !== undefined) {
        normalizedItem.notes = existingItem.notes;
      }
      if (existingItem.itemStatus !== undefined) {
        normalizedItem.itemStatus = existingItem.itemStatus;
      }
      if (existingItem.estimatedArrivalDate !== undefined) {
        normalizedItem.estimatedArrivalDate = existingItem.estimatedArrivalDate;
      }
      if (existingItem.supplierName !== undefined) {
        normalizedItem.supplierName = existingItem.supplierName;
      }
      if (existingItem.supplierOrderRef !== undefined) {
        normalizedItem.supplierOrderRef = existingItem.supplierOrderRef;
      }
      
      return normalizedItem;
    });
    
    const updatedItems: WorkOrderInventoryItem[] = [...normalizedCurrentItems, newItem];
    form.setValue("inventoryItems", updatedItems, { shouldValidate: true });
    setShowSpecialOrderForm(false);
  };

  const handleRemoveItem = (itemId: string) => {
    const currentItems = form.getValues("inventoryItems") || [];
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId);
    form.setValue("inventoryItems", updatedItems, { shouldValidate: true });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Normalize and update items
    const updatedItems: WorkOrderInventoryItem[] = currentItems.map((item: any) => {
      if (item.id === itemId) {
        const updatedItem: WorkOrderInventoryItem = {
          id: item.id || `temp-${Date.now()}`,
          name: item.name || 'Unknown Item',
          sku: item.sku || 'NO-SKU',
          category: item.category || 'General',
          quantity: newQuantity,
          unit_price: item.unit_price || 0,
          total: newQuantity * (item.unit_price || 0)
        };

        // Add optional properties only if they exist
        if (item.notes !== undefined) {
          updatedItem.notes = item.notes;
        }
        if (item.itemStatus !== undefined) {
          updatedItem.itemStatus = item.itemStatus;
        }
        if (item.estimatedArrivalDate !== undefined) {
          updatedItem.estimatedArrivalDate = item.estimatedArrivalDate;
        }
        if (item.supplierName !== undefined) {
          updatedItem.supplierName = item.supplierName;
        }
        if (item.supplierOrderRef !== undefined) {
          updatedItem.supplierOrderRef = item.supplierOrderRef;
        }

        return updatedItem;
      }
      
      // Normalize other items as well
      const normalizedItem: WorkOrderInventoryItem = {
        id: item.id || `temp-${Date.now()}`,
        name: item.name || 'Unknown Item',
        sku: item.sku || 'NO-SKU',
        category: item.category || 'General',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total: item.total || ((item.quantity || 1) * (item.unit_price || 0))
      };

      // Add optional properties only if they exist
      if (item.notes !== undefined) {
        normalizedItem.notes = item.notes;
      }
      if (item.itemStatus !== undefined) {
        normalizedItem.itemStatus = item.itemStatus;
      }
      if (item.estimatedArrivalDate !== undefined) {
        normalizedItem.estimatedArrivalDate = item.estimatedArrivalDate;
      }
      if (item.supplierName !== undefined) {
        normalizedItem.supplierName = item.supplierName;
      }
      if (item.supplierOrderRef !== undefined) {
        normalizedItem.supplierOrderRef = item.supplierOrderRef;
      }

      return normalizedItem;
    });

    form.setValue("inventoryItems", updatedItems, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowInventoryDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Inventory Item
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSpecialOrderForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Special Order Item
          </Button>
        </div>

        {inventoryItems.length > 0 && (
          <SelectedInventoryTable
            items={inventoryItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}

        <InventorySelectionDialog
          open={showInventoryDialog}
          onClose={() => setShowInventoryDialog(false)}
          onAddItems={handleAddInventoryItem}
        />

        <SpecialOrderItemForm
          open={showSpecialOrderForm}
          onClose={() => setShowSpecialOrderForm(false)}
          onAddItem={handleAddSpecialOrder}
        />
      </CardContent>
    </Card>
  );
};
