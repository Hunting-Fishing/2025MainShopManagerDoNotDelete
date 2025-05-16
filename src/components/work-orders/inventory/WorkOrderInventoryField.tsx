
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventorySectionHeader } from "./InventorySectionHeader";
import { SpecialOrderDialog } from "./SpecialOrderDialog";
import { useWorkOrderInventory } from "@/hooks/inventory/workOrder/useWorkOrderInventory";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderFormValues } from "@/types/workOrder";
import { WorkOrderInventoryItem } from "./WorkOrderInventoryItem";

interface WorkOrderInventoryFieldProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export const WorkOrderInventoryField: React.FC<WorkOrderInventoryFieldProps> = ({
  form
}) => {
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  
  const {
    showInventoryDialog,
    setShowInventoryDialog,
    items,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  } = useWorkOrderInventory(form);

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
    // Generate a temporary ID for the item
    const tempId = `temp-${Date.now()}`;
    
    const newItem: WorkOrderInventoryItem = {
      id: tempId,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      total: item.quantity * (item.unit_price || 0) // Ensure total is calculated
    };
    
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", [...currentItems, newItem], { shouldValidate: true });
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
              totalItems={items.length}
            />
            
            <WorkOrderInventoryTable 
              items={items} 
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
