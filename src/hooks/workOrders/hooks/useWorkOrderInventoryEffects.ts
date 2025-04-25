
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues, WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Hook to handle inventory-related side effects in work orders
 */
export const useWorkOrderInventoryEffects = (
  form: UseFormReturn<WorkOrderFormFieldValues>
) => {
  const workOrder = form.getValues();
  const inventoryItems = workOrder.inventoryItems || [];
  
  useEffect(() => {
    // This would normally update inventory status based on selected items
    console.log("Work order inventory items changed:", inventoryItems);
    
    // Track changes and update UI accordingly
    const totalParts = inventoryItems.length;
    const totalCost = inventoryItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
      
    console.log(`Total parts: ${totalParts}, Total cost: $${totalCost.toFixed(2)}`);
    
  }, [inventoryItems]);
  
  return {
    totalItems: inventoryItems.length,
    totalCost: inventoryItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0)
  };
};
