
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventorySectionHeader } from "./InventorySectionHeader";
import { SpecialOrderDialog } from "./SpecialOrderDialog";
import { useWorkOrderInventory } from "@/hooks/inventory/workOrder/useWorkOrderInventory";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { InventoryItemExtended } from "@/types/inventory";

interface WorkOrderInventoryFieldProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({
  form
}) => {
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  
  const {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  } = useWorkOrderInventory(form);

  // Convert selectedItems to proper WorkOrderInventoryItem type
  const convertedItems: WorkOrderInventoryItem[] = selectedItems.map(item => ({
    id: item.item.id,
    name: item.item.name,
    sku: item.item.sku,
    category: item.item.category,
    quantity: item.quantity,
    unitPrice: item.item.unit_price,
  }));

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
  const handleAddSpecialOrder = (item: Partial<WorkOrderInventoryItem>) => {
    // Generate a temporary ID for the item
    const tempId = `temp-${Date.now()}`;
    
    const newItem: WorkOrderInventoryItem = {
      id: item.id || tempId,
      name: item.name || "Special Order Item",
      sku: item.sku || tempId,
      category: item.category || "Special Order",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      itemStatus: item.itemStatus,
      estimatedArrivalDate: item.estimatedArrivalDate,
      supplierName: item.supplierName,
      supplierOrderRef: item.supplierOrderRef,
      notes: item.notes
    };
    
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", [...currentItems, newItem]);
  };

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
              totalItems={convertedItems.length}
            />
            
            <WorkOrderInventoryTable 
              items={convertedItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Standard Inventory Selection Dialog */}
          <InventorySelectionDialog
            open={showInventoryDialog}
            onOpenChange={setShowInventoryDialog}
            onAddItem={handleAddItem}
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
}
