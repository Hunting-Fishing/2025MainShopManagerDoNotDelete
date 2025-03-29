
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventorySectionHeader } from "./InventorySectionHeader";
import { useWorkOrderInventory } from "@/hooks/inventory/useWorkOrderInventory";

interface WorkOrderInventorySectionContainerProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventorySectionContainer: React.FC<WorkOrderInventorySectionContainerProps> = ({
  form
}) => {
  const {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  } = useWorkOrderInventory(form);

  return (
    <FormField
      name="inventoryItems"
      render={() => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Parts & Materials</FormLabel>
          
          <div className="space-y-4">
            <InventorySectionHeader onShowDialog={() => setShowInventoryDialog(true)} />
            
            <WorkOrderInventoryTable 
              items={selectedItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <InventorySelectionDialog
            open={showInventoryDialog}
            onOpenChange={setShowInventoryDialog}
            onAddItem={handleAddItem}
          />
        </FormItem>
      )}
    />
  );
};
