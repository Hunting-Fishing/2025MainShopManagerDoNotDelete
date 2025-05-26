

import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventorySectionHeader } from "./InventorySectionHeader";
import { SpecialOrderDialog } from "./SpecialOrderDialog";
import { useInventoryItemOperations } from "@/hooks/inventory/workOrder/useInventoryItemOperations";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderFormSchemaValues, workOrderInventoryItemSchema } from "@/schemas/workOrderSchema";
import { z } from "zod";

type WorkOrderInventoryItem = z.infer<typeof workOrderInventoryItemSchema>;

interface WorkOrderInventoryFieldProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({
  form
}) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  
  const {
    items,
    isAdding,
    addItem,
    removeItem,
    updateQuantity
  } = useInventoryItemOperations(form);

  // Fetch suppliers for special order dialog
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_suppliers')
          .select('name')
          .order('name');
          
        if (error) throw error;
        if (data) {
          setSuppliers(data.map(s => s.name));
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        // Fallback to default suppliers
        setSuppliers(["General Supplier", "Parts Warehouse", "Manufacturer"]);
      }
    };
    
    fetchSuppliers();
  }, []);

  // Handle adding a special order item
  const handleAddSpecialOrder = (item: any) => {
    // Ensure all required properties are present with proper defaults
    const newItem: WorkOrderInventoryItem = {
      id: item.id || `temp-${Date.now()}`,
      name: item.name || 'Special Order Item',
      sku: item.sku || `SO-${Date.now().toString(36)}`,
      category: item.category || 'Special Order',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      total: (item.quantity || 1) * (item.unit_price || 0),
      notes: item.notes,
      itemStatus: item.itemStatus || 'special-order',
      estimatedArrivalDate: item.estimatedArrivalDate,
      supplierName: item.supplierName,
      supplierOrderRef: item.supplierOrderRef
    };
    
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", [...currentItems, newItem], { shouldValidate: true });
  };

  // Convert items to proper WorkOrderInventoryItem format for display
  const workOrderItems: WorkOrderInventoryItem[] = items.map((item, index) => {
    // Build the item ensuring all required fields are strings/numbers, not undefined
    const mappedItem: WorkOrderInventoryItem = {
      id: item.id ?? `temp-${Date.now()}-${index}`,
      name: item.name ?? 'Unknown Item',
      sku: item.sku ?? 'NO-SKU',
      category: item.category ?? 'General',
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      total: item.total ?? ((item.quantity ?? 1) * (item.unit_price ?? 0))
    };
    
    // Add optional properties only if they exist
    if (item.notes !== undefined) {
      mappedItem.notes = item.notes;
    }
    if (item.itemStatus !== undefined) {
      mappedItem.itemStatus = item.itemStatus;
    }
    if (item.estimatedArrivalDate !== undefined) {
      mappedItem.estimatedArrivalDate = item.estimatedArrivalDate;
    }
    if (item.supplierName !== undefined) {
      mappedItem.supplierName = item.supplierName;
    }
    if (item.supplierOrderRef !== undefined) {
      mappedItem.supplierOrderRef = item.supplierOrderRef;
    }
    
    return mappedItem;
  });

  return (
    <FormField
      name="inventoryItems"
      render={() => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Parts & Materials</FormLabel>
          
          <div className="space-y-4">
            <InventorySectionHeader 
              onShowDialog={() => setShowInventoryDialog(true)}
              onShowSpecialOrderDialog={() => setShowSpecialOrderDialog(true)}
              totalItems={items.length}
            />
            
            <WorkOrderInventoryTable 
              items={workOrderItems} 
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>

          {/* Standard Inventory Selection Dialog */}
          <InventorySelectionDialog
            open={showInventoryDialog}
            onOpenChange={setShowInventoryDialog}
            onAddItem={addItem}
          />
          
          {/* Special Order Dialog */}
          <SpecialOrderDialog
            open={showSpecialOrderDialog}
            onOpenChange={setShowSpecialOrderDialog}
            onAddItem={handleAddSpecialOrder}
            suppliers={suppliers}
          />
        </FormItem>
      )}
    />
  );
};
