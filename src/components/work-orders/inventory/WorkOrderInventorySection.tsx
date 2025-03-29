
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventorySectionContainer } from "./WorkOrderInventorySectionContainer";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { toast } from "@/hooks/use-toast";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  // Use the inventory manager hook to access inventory management features
  const { checkInventoryAlerts, lowStockItems, outOfStockItems } = useInventoryManager();
  
  // Check for inventory alerts when this component mounts
  useEffect(() => {
    // This ensures inventory is checked when items are being added to work orders
    checkInventoryAlerts();
    
    // Display a notification if there are inventory alerts
    if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
      toast({
        title: "Inventory Alerts",
        description: `${lowStockItems.length} items low on stock, ${outOfStockItems.length} items out of stock.`,
        variant: "warning"
      });
    }
  }, [checkInventoryAlerts, lowStockItems, outOfStockItems]);
  
  return <WorkOrderInventorySectionContainer form={form} />;
};
