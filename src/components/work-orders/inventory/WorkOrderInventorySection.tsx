
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventorySectionContainer } from "./WorkOrderInventorySectionContainer";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  // Use the inventory manager hook to access inventory management features
  const { checkInventoryAlerts } = useInventoryManager();
  
  // Check for inventory alerts when this component mounts
  React.useEffect(() => {
    // This ensures inventory is checked when items are being added to work orders
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);
  
  return <WorkOrderInventorySectionContainer form={form} />;
};
